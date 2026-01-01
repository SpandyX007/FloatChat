# argo_mcp_server.py
import asyncio
import asyncpg
from mcp.server.fastmcp import FastMCPServer
from mcp.server.models import Tool

DB_DSN = "postgresql://user:password@localhost:5432/argo"

server = FastMCPServer("argo-metadata")


@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="get_measurements",
            description="Query ARGO measurements (temp, salinity, pressure) by region, depth(s), and time range",
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name != "get_measurements":
        raise ValueError("Unknown tool: " + name)

    params = arguments.get("parameters", [])  # ["temperature", "salinity"]
    depths = arguments.get("depths", [])      # list of depths or empty = all
    region = arguments.get("region", {})      # {"type": "point"/"bbox", "lat":..., "lon":..., "min_lat":..., ...}
    time_range = arguments.get("time_range", {})  # {"start":..., "end":...}

    # Build SELECT
    select_cols = ["depth"]
    if "temperature" in params:
        select_cols.append("temperature")
    if "salinity" in params:
        select_cols.append("salinity")
    if "pressure" in params:
        select_cols.append("pressure")

    select_sql = ", ".join(select_cols)

    q = f"""
        SELECT m.profile_id, p.lat, p.lon, p.time, {select_sql}
        FROM argo_measurements m
        JOIN argo_profiles p ON m.profile_id = p.profile_id
        WHERE 1=1
    """

    # Depth filter
    if depths:
        q += " AND m.depth = ANY($1)"
    else:
        q += " AND TRUE"

    # Time filter
    if time_range:
        q += " AND p.time BETWEEN $2 AND $3"

    # Region filter
    region_type = region.get("type")
    if region_type == "point":
        q += " ORDER BY point(p.lon, p.lat) <-> point($4, $5) LIMIT 1"
    elif region_type == "bbox":
        q += " AND p.lon BETWEEN $4 AND $5 AND p.lat BETWEEN $6 AND $7"

    # Collect query params
    params_list = []
    if depths:
        params_list.append(depths)
    if time_range:
        params_list.extend([time_range["start"], time_range["end"]])
    if region_type == "point":
        params_list.extend([region["lon"], region["lat"]])
    elif region_type == "bbox":
        params_list.extend([region["min_lon"], region["max_lon"],
                            region["min_lat"], region["max_lat"]])

    # Run query
    conn = await asyncpg.connect(DB_DSN)
    rows = await conn.fetch(q, *params_list)
    await conn.close()

    return [dict(r) for r in rows]


if __name__ == "__main__":
    asyncio.run(server.run())