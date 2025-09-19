# from fastapi import APIRouter
# import os
# from dotenv import load_dotenv
# # from get_response import gemini
# from pydantic import BaseModel
# from get_response import new
# from get_response import llm_handler
# load_dotenv()

# chat_router=APIRouter()

# class ChatRequest(BaseModel):
#     query: str

# @chat_router.post("/chat-response")
# async def get_response(payload: ChatRequest):
#     # res = gemini.gemini_response(payload.query)
#     # cd=gemini.get_coordinates(payload.res)
#     # res=new.gemini_response(payload.query)
#     # chat=new.get_region_bbox(res)
#     # chat=new.main(payload.query)
#     chat=llm_handler.process_query(payload.query)
#     return chat






from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import pandas as pd

from get_response import llm_handler
from utils.selection import select_from_llm_payload

load_dotenv()
chat_router = APIRouter()

# TODO: Replace with your real metadata loaders
def load_datasets() -> tuple[pd.DataFrame, pd.DataFrame]:
    # Example placeholders; update paths/sources as needed
    # core = pd.read_csv("../data/data.csv")
    # bgc = pd.read_csv("../data/data.csv")
    core = pd.DataFrame()  # no core? keep empty
    bgc = pd.DataFrame()   # no bgc? keep empty
    return core, bgc

CORE_DF, BGC_DF = load_datasets()

class ChatRequest(BaseModel):
    query: str

@chat_router.post("/chat-response")
async def get_response(payload: ChatRequest):
    try:
        # 1) Extract structured filters from LLM
        llm = llm_handler.process_query(payload.query)
        # llm looks like:
        # {
        #   "time_duration": {"start_time":"YYYY-MM-DD","end_time":"YYYY-MM-DD"},
        #   "parameters": [...],
        #   "depth": "...",
        #   "bbox": [min_lon, max_lon, min_lat, max_lat]
        # }

        # 2) Filter metadata using selection.py
        # If you know your bbox is lon/lat order, set bbox_order="lonlat".
        # Otherwise use "auto" to detect.
        filtered = select_from_llm_payload(
            core_df=CORE_DF,
            bgc_df=BGC_DF,
            llm_payload=llm,
            bbox_order="auto",          # or "lonlat"
            normalize_longitudes=True,
            downsample=True,
            samples_per_bin=3,
        )

        # 3) Return JSON-safe response
        return {
            "filters": llm,
            "count": int(len(filtered)),
            "results": filtered.to_dict(orient="records"),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))