# from __future__ import annotations

# from fastapi import APIRouter, HTTPException, Query
# from pydantic import BaseModel
# from typing import Optional
# import pandas as pd
# import json
# # from parameters.parametersapi import bbox_region_filter

# read_parameters = APIRouter(prefix="/parameters", tags=["parameters"])

# # In-memory dataset storage
# _last_df: Optional[pd.DataFrame] = None
# _last_records: list[dict] = []


# class ChatRequest(BaseModel):
#     query: str


# # -------------------- Helpers --------------------

# def _is_epoch_ms_series(s: pd.Series) -> bool:
#     """Check if a series looks like epoch milliseconds."""
#     try:
#         sn = pd.to_numeric(s, errors="coerce").dropna()
#         if sn.empty:
#             return False
#         return sn.median() > 10_000_000_000
#     except Exception:
#         return False


# def df_to_records(df: pd.DataFrame) -> list[dict]:
#     """
#     Convert DataFrame to JSON-safe records.
#     All values are coerced to strings for safe frontend rendering.
#     """
#     if df is None or df.empty:
#         return []
#     tmp = df.copy()

#     # Convert all values to string
#     tmp = tmp.astype(str)

#     return json.loads(tmp.to_json(orient="records"))


# def _ensure_profile_date(df: pd.DataFrame) -> pd.DataFrame:
#     """
#     Ensure 'profile_date' column exists and is normalized.
#     Keeps the original 'month' column unchanged.
#     """
#     if "month" not in df.columns:
#         raise ValueError("Input DataFrame must contain a 'month' column.")

#     out = df.copy()
#     month_series = out["month"]

#     if _is_epoch_ms_series(month_series):
#         ts = pd.to_datetime(pd.to_numeric(month_series, errors="coerce"), unit="ms", errors="coerce")
#     else:
#         ts = pd.to_datetime(month_series, errors="coerce")

#     ts = ts.dt.floor("D")
#     out["profile_date"] = ts.dt.strftime("%Y-%m-%d %H:%M:%S")

#     return out


# def _rename_surface_columns(df: pd.DataFrame) -> pd.DataFrame:
#     """Rename to expected surface keys."""
#     out = df.copy()
#     rename_map = {
#         "TEMP_surface_0_100": "TEMP_Surface(0-100m)",
#         "PSAL_surface_0_100": "PSAL_Surface(0-100m)",
#         "RHO_surface_0_100": "RHO_Surface(0-100m)",
#         "N2_surface_0_100": "N2_Surface(0-100m)",
#         "SOUND_surface_0_100": "SOUND_Surface(0-100m)",
#     }
#     out.rename(columns={src: tgt for src, tgt in rename_map.items() if src in out.columns}, inplace=True)
#     return out


# # -------------------- Endpoints --------------------

# @read_parameters.post("/user-query")
# async def user_query(payload: ChatRequest):
#     """
#     Run your pipeline (host_process) and store the resulting DataFrame in-memory.
#     Returns a JSON-safe preview under 'df'.
#     """
#     global _last_df, _last_records

#     try:
#         from utils.client import host_process  # lazy import
#     except Exception as e:
#         raise HTTPException(status_code=501, detail=f"host_process not available: {e}")

#     llm_response, dataframe = host_process(payload.query)

#     if isinstance(dataframe, pd.DataFrame):
#         df = dataframe.copy().reset_index(drop=True)
#         df = _rename_surface_columns(df)
#         df = _ensure_profile_date(df)
#         _last_df = df
#         _last_records = df_to_records(df)
#     elif isinstance(dataframe, list):
#         try:
#             df = pd.DataFrame.from_records(dataframe)
#             df = _rename_surface_columns(df)
#             df = _ensure_profile_date(df)
#             _last_df = df
#             _last_records = df_to_records(df)
#         except Exception:
#             _last_df, _last_records = None, []
#     else:
#         _last_df, _last_records = None, []

#     return {"response": llm_response, "df": _last_records}


# @read_parameters.get("/read-params")
# async def get_params(
#     limit: int = Query(default=10000, ge=1, le=200000)
# ):
#     """
#     Serve the last dataset in normalized form, keeping 'month' and adding 'profile_date'.
#     All values are serialized as strings.
#     """
#     global _last_df, _last_records

#     if _last_df is None and _last_records:
#         try:
#             _last_df = pd.DataFrame.from_records(_last_records)
#         except Exception:
#             pass

#     if _last_df is None or _last_df.empty:
#         raise HTTPException(status_code=404, detail="No dataset available. POST to /parameters/user-query first.")

#     df = _ensure_profile_date(_last_df)
#     df = _rename_surface_columns(df)

#     # Select columns: month, profile_date, + surface metrics
#     expected_cols = [
#         "month",
#         "profile_date",
#         "TEMP_Surface(0-100m)",
#         "PSAL_Surface(0-100m)",
#         "RHO_Surface(0-100m)",
#         "N2_Surface(0-100m)",
#         "SOUND_Surface(0-100m)"
#     ]
#     df_out = df[[c for c in expected_cols if c in df.columns]].copy()

#     # Drop rows where all metrics are NaN
#     metrics = [c for c in expected_cols[2:] if c in df_out.columns]
#     if metrics:
#         df_out = df_out.dropna(subset=metrics, how="all")

#     out = df_to_records(df_out.head(limit))
#     return {"response": out}


# # @read_parameters.get("/get-maps")
# # async def get_maps():
# #     pass






from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import json
import os

read_parameters = APIRouter(prefix="/parameters", tags=["parameters"])

# In-memory dataset storage
_last_df: Optional[pd.DataFrame] = None
_last_records: list[dict] = []


class ChatRequest(BaseModel):
    query: str


# -------------------- Helpers --------------------

def _is_epoch_ms_series(s: pd.Series) -> bool:
    """Check if a series looks like epoch milliseconds."""
    try:
        sn = pd.to_numeric(s, errors="coerce").dropna()
        if sn.empty:
            return False
        return sn.median() > 10_000_000_000
    except Exception:
        return False


def df_to_records(df: pd.DataFrame) -> list[dict]:
    """Convert DataFrame to JSON-safe records."""
    if df is None or df.empty:
        return []
    tmp = df.copy()
    
    # Keep numeric values as numbers, not strings
    for col in tmp.columns:
        if tmp[col].dtype in ['object', 'string']:
            # Try to convert string numbers back to float
            numeric = pd.to_numeric(tmp[col], errors='coerce')
            if not numeric.isna().all():
                tmp[col] = numeric
    
    return json.loads(tmp.to_json(orient="records"))


def _ensure_profile_date(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure 'profile_date' column exists and is normalized."""
    if "month" not in df.columns:
        raise ValueError("Input DataFrame must contain a 'month' column.")

    out = df.copy()
    month_series = out["month"]

    if _is_epoch_ms_series(month_series):
        ts = pd.to_datetime(pd.to_numeric(month_series, errors="coerce"), unit="ms", errors="coerce")
    else:
        ts = pd.to_datetime(month_series, errors="coerce")

    ts = ts.dt.floor("D")
    out["profile_date"] = ts.dt.strftime("%Y-%m-%d %H:%M:%S")

    return out


def _rename_surface_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Rename to expected surface keys."""
    out = df.copy()
    rename_map = {
        "TEMP_surface_0_100": "TEMP_Surface(0-100m)",
        "PSAL_surface_0_100": "PSAL_Surface(0-100m)",
        "RHO_surface_0_100": "RHO_Surface(0-100m)",
        "N2_surface_0_100": "N2_Surface(0-100m)",
        "SOUND_surface_0_100": "SOUND_Surface(0-100m)",
        
    }
    out.rename(columns={src: tgt for src, tgt in rename_map.items() if src in out.columns}, inplace=True)
    return out


# -------------------- Endpoints --------------------

@read_parameters.post("/user-query")
async def user_query(payload: ChatRequest):
    """
    Run your pipeline (host_process) and store the resulting DataFrame in-memory.
    Returns both LLM response and the chart data immediately.
    """
    global _last_df, _last_records

    try:
        from utils.client import host_process  # lazy import
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"host_process not available: {e}")

    llm_response, dataframe = host_process(payload.query)

    if isinstance(dataframe, pd.DataFrame):
        df = dataframe.copy().reset_index(drop=True)
        df = _rename_surface_columns(df)
        df = _ensure_profile_date(df)
        _last_df = df
        _last_records = df_to_records(df)
    elif isinstance(dataframe, list):
        try:
            df = pd.DataFrame.from_records(dataframe)
            df = _rename_surface_columns(df)
            df = _ensure_profile_date(df)
            _last_df = df
            _last_records = df_to_records(df)
        except Exception:
            _last_df, _last_records = None, []
    else:
        _last_df, _last_records = None, []

    # Return both the LLM response and the chart data
    return {
        "response": llm_response, 
        "chart_data": _last_records  # Add chart data to immediate response
    }


@read_parameters.get("/read-params")
async def get_params(limit: int = Query(default=10000, ge=1, le=200000)):
    """Serve the last dataset in normalized form."""
    global _last_df, _last_records

    if _last_df is None and _last_records:
        try:
            _last_df = pd.DataFrame.from_records(_last_records)
        except Exception:
            pass

    if _last_df is None or _last_df.empty:
        raise HTTPException(status_code=404, detail="No dataset available. POST to /parameters/user-query first.")

    df = _ensure_profile_date(_last_df)
    df = _rename_surface_columns(df)

    expected_cols = [
        "month", "profile_date", "TEMP_Surface(0-100m)", "PSAL_Surface(0-100m)", 
        "RHO_Surface(0-100m)", "N2_Surface(0-100m)", "SOUND_Surface(0-100m)"
    ]
    df_out = df[[c for c in expected_cols if c in df.columns]].copy()

    metrics = [c for c in expected_cols[2:] if c in df_out.columns]
    if metrics:
        df_out = df_out.dropna(subset=metrics, how="all")

    out = df_to_records(df_out.head(limit))
    return {"response": out}


# read_parameters = APIRouter(prefix="/parameters", tags=["parameters"])

@read_parameters.get("/get-maps")
async def get_maps():
    csv_path = r"D:\BMSIT College Docs\SEM5\MiniProject\React_frontend\ocean-scribe-charts-main\backend\map_coordinates.csv"
    
    # Read CSV
    map_df = pd.read_csv(csv_path)

    # Extract profile name from 'file' column
    map_df["profile_name"] = map_df["file"].apply(lambda x: os.path.splitext(os.path.basename(x))[0])

    # Build dictionary
    result = {
        row["profile_name"]: {
            "latitude": row["latitude"],
            "longitude": row["longitude"]
        }
        for _, row in map_df.iterrows()
    }

    return result
