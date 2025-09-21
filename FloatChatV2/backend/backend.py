# from fastapi import FastAPI
# from fastapi.responses import StreamingResponse
# from io import StringIO
# import pandas as pd

# app=FastAPI()

# @app.get("/data_csv")
# def get_csv():
#     csvdf = pd.read_csv("filtered_profiles.csv")
#     stream = StringIO()
#     csvdf.to_csv(stream, index=False)
#     stream.seek(0)
#     return StreamingResponse(stream, media_type="text/csv")







# from fastapi import FastAPI
# from fastapi.responses import StreamingResponse
# from io import StringIO
# import pandas as pd
# import selection
# from pydantic import BaseModel
# import llm_handler

# app=FastAPI()

# # implement a separate post api to get the llm response
# local_storage={}

# # chat_router=APIRouter()

# class ChatRequest(BaseModel):
#     query: str

# @app.post("/chat-response")
# async def get_response(payload: ChatRequest):
#     # res = gemini.gemini_response(payload.query)
#     # cd=gemini.get_coordinates(payload.res)
#     # res=new.gemini_response(payload.query)
#     # chat=new.get_region_bbox(res)
#     # chat=new.main(payload.query)
#     chat=llm_handler.process_query(payload.query)
    
#     return chat

# @app.get("/data_csv")
# async def get_csv():
#     # df = pd.DataFrame({"name": ["Alice", "Bob"], "age": [25, 30]})
#     core = pd.read_csv(r"D:\BMSIT College Docs\SEM5\MiniProject\FloatChat\backend\api\argo_core.csv")

#     bgc = pd.read_csv(r"D:\BMSIT College Docs\SEM5\MiniProject\FloatChat\backend\api\argo_bgc.csv")

#     df = selection.process_and_filter_profiles(core_df=core, bgc_df=bgc,bbox=[80.0,100.0,5.0,22.0],start_date="2015-01-01",end_date="2018-01-01",samples_per_bin=3)
#     stream = StringIO()
#     df.to_csv(stream, index=False)
#     stream.seek(0)
#     return StreamingResponse(stream, media_type="text/csv")






import os,sys
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from io import StringIO
from typing import Dict, Any, List, Tuple
import pandas as pd
from pydantic import BaseModel

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import selection
from llm import llm_handler

app = FastAPI()

# Simple in-memory storage for the latest LLM filters
local_storage: Dict[str, Any] = {}

class ChatRequest(BaseModel):
    query: str

def _extract_filters(filters: Dict[str, Any]) -> Tuple[List[float], str, str, List[str]]:
    """
    Convert the LLM response into bbox, start_date, end_date, parameters.
    Expects:
      {
        "time_duration": {"start_time": "...", "end_time": "..."},
        "bbox": [min_lon, max_lon, min_lat, max_lat],
        "parameters": [...],
        "depth": "..."
      }
    """
    td = filters.get("time_duration") or {}
    start_date = str(td.get("start_time") or td.get("start") or td.get("from") or "")
    end_date = str(td.get("end_time") or td.get("end") or td.get("to") or "")

    bbox_in = filters.get("bbox")
    if not isinstance(bbox_in, (list, tuple)) or len(bbox_in) < 4:
        raise ValueError("Invalid bbox; expected [min_lon, max_lon, min_lat, max_lat].")
    bbox = [float(bbox_in[0]), float(bbox_in[1]), float(bbox_in[2]), float(bbox_in[3])]

    params = filters.get("parameters") or []
    if isinstance(params, str):
        params = [p.strip() for p in params.split(",") if p.strip()]
    params = [str(p) for p in params]

    return bbox, start_date, end_date, params

@app.post("/chat-response")
async def get_response(payload: ChatRequest):
    """
    Calls the LLM, stores the structured filters in local_storage, and returns them.
    """
    filters = llm_handler.process_query(payload.query)
    local_storage["latest_filters"] = filters
    return filters

@app.get("/data_csv")
async def get_csv():
    """
    Uses the last filters stored by POST /chat-response to produce a filtered CSV.
    """
    # Ensure filters exist
    filters = local_storage.get("latest_filters")
    if not filters:
        raise HTTPException(status_code=400, detail="No filters found. Call POST /chat-response first.")

    # Extract bbox and date range (and parameters)
    try:
        bbox, start_date, end_date, required_params = _extract_filters(filters)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid filters: {e}")

    #change paths accordingly
    # Load datasets (adjust paths as needed)
    core = pd.read_csv(r"D:\BMSIT College Docs\SEM5\MiniProject\FloatChat\backend\api\argo_core.csv", low_memory=False)
    bgc = pd.read_csv(r"D:\BMSIT College Docs\SEM5\MiniProject\FloatChat\backend\api\argo_bgc.csv", low_memory=False)

    # Filter using selection.py with LLM-provided bbox/start/end/parameters
    df = selection.process_and_filter_profiles(
        core_df=core,
        bgc_df=bgc,
        bbox=bbox,
        start_date=start_date,
        end_date=end_date,
        required_params=required_params,
        normalize_longitudes=True,
        bbox_order="lonlat",  # LLM returns [min_lon, max_lon, min_lat, max_lat]
        downsample=True,
        samples_per_bin=3,
    )

    # Stream CSV to client
    stream = StringIO()
    # Optional: format datetimes for CSV
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = pd.to_datetime(df[col], errors="coerce").dt.strftime("%Y-%m-%dT%H:%M:%S")
    df.to_csv(stream, index=False)
    stream.seek(0)
    return StreamingResponse(stream, media_type="text/csv")