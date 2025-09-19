from typing import Any, Dict, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

# Create Gemini client with explicit API key from .env
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def _coerce_output(payload: Dict[str, Any]) -> Dict[str, Any]:
    # Ensure keys exist
    out: Dict[str, Any] = {
        "time_duration": payload.get("time_duration", ""),
        "region": payload.get("region", ""),
        "parameters": payload.get("parameters", []),
        "depth": payload.get("depth", ""),
    }
    # Coerce parameters -> list[str]
    params = out["parameters"]
    if isinstance(params, str):
        out["parameters"] = [p.strip() for p in params.split(",") if p.strip()]
    elif isinstance(params, list):
        out["parameters"] = [str(p) for p in params]
    else:
        out["parameters"] = []
    # Coerce depth -> str
    if not isinstance(out["depth"], str):
        out["depth"] = json.dumps(out["depth"])
    return out

def gemini_response(query: str) -> Dict[str, Any]:
    config = types.GenerateContentConfig(
        system_instruction=(
            "Return ONLY a JSON object with keys: time_duration, region, parameters, depth. "
            "No explanations, no markdown."
        ),
        response_mime_type="application/json",
        response_schema=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "time_duration": types.Schema(type=types.Type.STRING),
                "region": types.Schema(type=types.Type.STRING),
                "parameters": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(type=types.Type.STRING),
                ),
                "depth": types.Schema(type=types.Type.STRING),
            },
            required=["time_duration", "region", "parameters", "depth"],
        ),
    )

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        config=config,
        contents=query
    )

    if getattr(resp, "parsed", None) is not None:
        try:
            return _coerce_output(dict(resp.parsed))
        except Exception:
            pass

    try:
        raw = json.loads(resp.text)
        if isinstance(raw, dict):
            return _coerce_output(raw)
        return _coerce_output({})
    except Exception:
        return {
            "time_duration": "",
            "region": "",
            "parameters": [],
            "depth": "",
        }

# ---------------- Added from first script ---------------- #

def get_region_bbox(query_json: Dict[str, Any]) -> Dict[str, Any] | None:
    """
    Takes the dict returned from gemini_response() and resolves
    its 'region' into a bounding box using Gemini.
    """
    region_name = query_json.get("region")
    if not region_name:
        print("Error: No region found in query.")
        return None

    prompt = (
        f"Give me the bounding box coordinates (min_lon, max_lon, min_lat, max_lat) "
        f"for the region '{region_name}'. Provide the answer as a JSON array of four "
        f"floating-point numbers, e.g., [-12.345, -67.890, 23.456, 78.901]. "
        f"Do not include any other text."
    )

    try:
        resp = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        response_text = resp.text.strip()

        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        bbox_coords = json.loads(response_text)

        if not (
            isinstance(bbox_coords, list)
            and len(bbox_coords) == 4
            and all(isinstance(x, (int, float)) for x in bbox_coords)
        ):
            print("Error: Invalid response format from Gemini API.")
            return None

        processed_query = query_json.copy()
        processed_query["region"] = {"bbox": bbox_coords}
        return processed_query

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def main(query:str):
    res=gemini_response(query)
    chat=get_region_bbox(res)
    return chat

# query=gemini_response("Show me Salinity for south china sea for last year")
# res=get_region_bbox(query)
# print(res)