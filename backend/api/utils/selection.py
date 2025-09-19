# import pandas as pd
# import numpy as np
# from sklearn.cluster import KMeans
# import pandas as pd
# import numpy as np
# from sklearn.cluster import DBSCAN
# from sklearn.preprocessing import StandardScaler
# import math
# import geopandas as gpd
# from shapely.geometry import Point
# from shapely.geometry.polygon import Polygon
# from datetime import datetime

# # -----------------------
# # Helper utilities
# # -----------------------
# def _normalize_longitudes_array(lons: np.ndarray) -> np.ndarray:
#     """Convert longitudes > 180 into [-180, 180] range."""
#     lons = np.asarray(lons, dtype="float64")
#     mask = np.isfinite(lons) & (lons > 180)
#     lons[mask] -= 360.0
#     return lons

# def _bbox_contains_points(lat, lon, bbox):
#     """Check whether (lat, lon) points fall inside bbox = [lon_min, lon_max, lat_min, lat_max]."""
#     lon_min, lon_max, lat_min, lat_max = bbox
#     lon = np.asarray(lon, dtype="float64")
#     lat = np.asarray(lat, dtype="float64")

#     if lon_min <= lon_max:
#         lon_mask = (lon >= lon_min) & (lon <= lon_max)
#     else:  # handle dateline crossing
#         lon_mask = (lon >= lon_min) | (lon <= lon_max)
#     lat_mask = (lat >= lat_min) & (lat <= lat_max)
#     return lon_mask & lat_mask

# def _auto_detect_bbox_order(df_list, bbox):
#     """Detect whether bbox is lon-lat or lat-lon based on which fits more points."""
#     if len(bbox) != 4:
#         raise ValueError("bbox must have 4 elements")

#     lonlat = [bbox[0], bbox[1], bbox[2], bbox[3]]
#     latlon = [bbox[1], bbox[0], bbox[3], bbox[2]]

#     counts = {"lonlat": 0, "latlon": 0}
#     for df in df_list:
#         if df is None or df.empty:
#             continue
#         lat = df["latitude"].to_numpy(dtype="float64")
#         lon = df["longitude"].to_numpy(dtype="float64")
#         counts["lonlat"] += np.nansum(_bbox_contains_points(lat, lon, lonlat))
#         counts["latlon"] += np.nansum(_bbox_contains_points(lat, lon, latlon))

#     return latlon if counts["latlon"] > counts["lonlat"] else lonlat

# # -----------------------
# # Adaptive spatiotemporal sampler
# # -----------------------
# def adaptive_temporal_sampler(df, time_col="date", samples_per_bin=3):
#     """
#     Downsample profiles:
#       - Splits dataset into temporal bins (weekly, fortnightly, monthly, yearly).
#       - From each bin, picks up to `samples_per_bin` spatially diverse profiles via KMeans.
#     """
#     if df.empty:
#         return df.copy()

#     df = df.copy()
#     df[time_col] = pd.to_datetime(df[time_col], errors="coerce")
#     df = df.dropna(subset=[time_col, "latitude", "longitude"])
#     if df.empty:
#         return df

#     start, end = df[time_col].min(), df[time_col].max()
#     duration_days = (end - start).days if pd.notnull(end) and pd.notnull(start) else 0

#     if duration_days <= 180:
#         freq = "7D"
#     elif duration_days <= 365:
#         freq = "14D"
#     elif duration_days <= 3650:
#         freq = "30D"
#     else:
#         freq = "365D"

#     periods = pd.date_range(start, end + pd.Timedelta(days=1), freq=freq)
#     if len(periods) < 2:
#         periods = pd.to_datetime([start, end + pd.Timedelta(days=1)])

#     sampled_indices = []
#     coords_cols = ["latitude", "longitude"]

#     for i in range(len(periods) - 1):
#         s, e = periods[i], periods[i + 1]
#         win = df[(df[time_col] >= s) & (df[time_col] < e)]
#         if win.empty:
#             continue

#         n_clusters = min(samples_per_bin, len(win))
#         if n_clusters == 1:
#             sampled_indices.append(win.index[0])
#             continue

#         coords = win[coords_cols].to_numpy(dtype="float64")
#         kmeans = KMeans(n_clusters=n_clusters, random_state=0, n_init=4)
#         labels = kmeans.fit_predict(coords)
#         centers = kmeans.cluster_centers_

#         for cid in range(n_clusters):
#             mask = labels == cid
#             if not np.any(mask):
#                 continue
#             idxs = win.index.to_numpy()[mask]
#             cluster_coords = coords[mask]
#             d2 = np.sum((cluster_coords - centers[cid]) ** 2, axis=1)
#             sampled_indices.append(idxs[np.argmin(d2)])

#     return df.loc[sampled_indices].drop_duplicates().reset_index(drop=True)

# # -----------------------
# # Main pipeline
# # -----------------------
# def process_and_filter_profiles(
#     core_df: pd.DataFrame,
#     bgc_df: pd.DataFrame,
#     bbox,
#     start_date,
#     end_date,
#     required_params=None,
#     normalize_longitudes=True,
#     bbox_order="auto",
#     downsample=True,
#     samples_per_bin=3,
# ):
#     """
#     Process and filter Argo profile metadata:
#       - Time + spatial bbox filter
#       - Optional param filter for BGC
#       - Optional temporal-spatial downsampling
#     """
#     core = core_df.copy() if core_df is not None else pd.DataFrame()
#     bgc = bgc_df.copy() if bgc_df is not None else pd.DataFrame()

#     # validate required columns
#     for name, df in (("core", core), ("bgc", bgc)):
#         if not df.empty and not {"latitude", "longitude", "date"}.issubset(df.columns):
#             raise ValueError(f"{name}_df must contain 'latitude','longitude','date' columns")

#     # normalize longitudes
#     if normalize_longitudes:
#         if not core.empty:
#             core["longitude"] = _normalize_longitudes_array(core["longitude"])
#         if not bgc.empty:
#             bgc["longitude"] = _normalize_longitudes_array(bgc["longitude"])

#     # interpret bbox
#     if bbox_order == "lonlat":
#         canonical_bbox = [bbox[0], bbox[1], bbox[2], bbox[3]]
#     elif bbox_order == "latlon":
#         canonical_bbox = [bbox[1], bbox[0], bbox[3], bbox[2]]
#     else:
#         canonical_bbox = _auto_detect_bbox_order([core, bgc], bbox)

#     # time filter
#     start_ts, end_ts = pd.to_datetime(start_date), pd.to_datetime(end_date)

#     def _time_filter(df):
#         if df.empty:
#             return df
#         df = df.copy()
#         df["date"] = pd.to_datetime(df["date"], errors="coerce")
#         return df[(df["date"] >= start_ts) & (df["date"] <= end_ts)].reset_index(drop=True)

#     core, bgc = _time_filter(core), _time_filter(bgc)

#     # spatial filter
#     def _spatial_filter(df):
#         if df.empty:
#             return df
#         mask = _bbox_contains_points(df["latitude"], df["longitude"], canonical_bbox)
#         return df[mask].reset_index(drop=True)

#     core, bgc = _spatial_filter(core), _spatial_filter(bgc)

#     # param filter (bgc only)
#     if required_params and not bgc.empty:
#         parms = bgc["parameters"].fillna("").astype(str)
#         mask = np.ones(len(parms), dtype=bool)
#         for tok in required_params:
#             if not tok:
#                 continue
#             mask &= parms.str.contains(rf"\b{pd.util.escape_regex(tok)}\b", case=False, na=False)
#         bgc = bgc[mask].reset_index(drop=True)

#     if not core.empty:
#         core = core.assign(source="core")
#     if not bgc.empty:
#         bgc = bgc.assign(source="bgc")

#     combined = pd.concat([core, bgc], ignore_index=True, sort=False)
#     if combined.empty:
#         print("No profiles found.")
#         return combined

#     print(f"Profiles before sampling: {len(combined)}")

#     if downsample:
#         combined = adaptive_temporal_sampler(combined, time_col="date", samples_per_bin=samples_per_bin)
#         print(f"Profiles after sampling: {len(combined)}")

#     return combined.reset_index(drop=True)






from __future__ import annotations

import re
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from typing import List, Tuple, Dict, Any


# -----------------------
# Helper utilities
# -----------------------
def _normalize_longitudes_array(lons: np.ndarray) -> np.ndarray:
    """
    Normalize longitudes to [-180, 180].
    """
    lons = np.asarray(lons, dtype="float64")
    # robust wrap to [-180, 180]
    lons = ((lons + 180.0) % 360.0) - 180.0
    return lons


def _bbox_contains_points(lat, lon, bbox):
    """
    Check whether (lat, lon) fall inside bbox = [lon_min, lon_max, lat_min, lat_max].
    Supports dateline crossing when lon_min > lon_max.
    """
    lon_min, lon_max, lat_min, lat_max = bbox
    lon = np.asarray(lon, dtype="float64")
    lat = np.asarray(lat, dtype="float64")

    if lon_min <= lon_max:
        lon_mask = (lon >= lon_min) & (lon <= lon_max)
    else:
        # Dateline crossing: e.g., lon_min=170, lon_max=-170 => [170..180] U [-180..-170]
        lon_mask = (lon >= lon_min) | (lon <= lon_max)
    lat_mask = (lat >= lat_min) & (lat <= lat_max)
    return lon_mask & lat_mask


def _auto_detect_bbox_order(df_list: List[pd.DataFrame], bbox: List[float]) -> List[float]:
    """
    Detect whether incoming bbox is lon-lat or lat-lon based on which
    option contains more points across provided dataframes.

    Returns canonical bbox in lon-lat order: [lon_min, lon_max, lat_min, lat_max]
    """
    if not isinstance(bbox, (list, tuple)) or len(bbox) != 4:
        raise ValueError("bbox must have 4 elements")

    lonlat = [bbox[0], bbox[1], bbox[2], bbox[3]]
    latlon = [bbox[1], bbox[0], bbox[3], bbox[2]]

    counts = {"lonlat": 0, "latlon": 0}
    for df in df_list:
        if df is None or df.empty:
            continue
        lat = df["latitude"].to_numpy(dtype="float64")
        lon = df["longitude"].to_numpy(dtype="float64")
        counts["lonlat"] += np.nansum(_bbox_contains_points(lat, lon, lonlat))
        counts["latlon"] += np.nansum(_bbox_contains_points(lat, lon, latlon))

    return latlon if counts["latlon"] > counts["lonlat"] else lonlat


# -----------------------
# Adaptive spatiotemporal sampler
# -----------------------
def adaptive_temporal_sampler(df: pd.DataFrame, time_col: str = "date", samples_per_bin: int = 3) -> pd.DataFrame:
    """
    Downsample profiles:
      - Splits dataset into temporal bins (weekly, fortnightly, monthly, yearly) depending on span.
      - From each bin, picks up to samples_per_bin spatially diverse profiles via KMeans on [lat, lon].
    """
    if df is None or df.empty:
        return df.copy()

    df = df.copy()
    df[time_col] = pd.to_datetime(df[time_col], errors="coerce")
    df = df.dropna(subset=[time_col, "latitude", "longitude"])
    if df.empty:
        return df

    start, end = df[time_col].min(), df[time_col].max()
    duration_days = (end - start).days if pd.notnull(end) and pd.notnull(start) else 0

    if duration_days <= 180:
        freq = "7D"
    elif duration_days <= 365:
        freq = "14D"
    elif duration_days <= 3650:
        freq = "30D"
    else:
        freq = "365D"

    periods = pd.date_range(start, end + pd.Timedelta(days=1), freq=freq)
    if len(periods) < 2:
        periods = pd.to_datetime([start, end + pd.Timedelta(days=1)])

    sampled_indices: List[int] = []
    coords_cols = ["latitude", "longitude"]

    for i in range(len(periods) - 1):
        s, e = periods[i], periods[i + 1]
        win = df[(df[time_col] >= s) & (df[time_col] < e)]
        if win.empty:
            continue

        n_clusters = min(int(samples_per_bin), len(win))
        if n_clusters <= 1:
            sampled_indices.append(win.index[0])
            continue

        coords = win[coords_cols].to_numpy(dtype="float64")
        try:
            kmeans = KMeans(n_clusters=n_clusters, random_state=0, n_init=10)
            labels = kmeans.fit_predict(coords)
            centers = kmeans.cluster_centers_
        except Exception:
            # Fallback: just pick first n_clusters rows for this bin
            sampled_indices.extend(list(win.index[:n_clusters]))
            continue

        for cid in range(n_clusters):
            mask = labels == cid
            if not np.any(mask):
                continue
            idxs = win.index.to_numpy()[mask]
            cluster_coords = coords[mask]
            d2 = np.sum((cluster_coords - centers[cid]) ** 2, axis=1)
            sampled_indices.append(int(idxs[np.argmin(d2)]))

    if not sampled_indices:
        return df.iloc[: min(samples_per_bin, len(df))].reset_index(drop=True)

    return df.loc[sorted(set(sampled_indices))].reset_index(drop=True)


# -----------------------
# Main pipeline
# -----------------------
def process_and_filter_profiles(
    core_df: pd.DataFrame,
    bgc_df: pd.DataFrame,
    bbox: List[float],
    start_date,
    end_date,
    required_params: List[str] | None = None,
    normalize_longitudes: bool = True,
    bbox_order: str = "auto",  # "lonlat" | "latlon" | "auto"
    downsample: bool = True,
    samples_per_bin: int = 3,
) -> pd.DataFrame:
    """
    Process and filter Argo profile metadata:
      - Time + spatial bbox filter
      - Optional parameter filter for BGC rows (string token match)
      - Optional temporal-spatial downsampling

    Inputs:
      - core_df, bgc_df: DataFrames with columns: latitude, longitude, date
        bgc_df may include a "parameters" column for filtering.
      - bbox: [min_lon, max_lon, min_lat, max_lat]
      - start_date, end_date: parseable by pandas.to_datetime
      - required_params: tokens to match in bgc_df["parameters"] (case-insensitive)
    """
    core = core_df.copy() if core_df is not None else pd.DataFrame()
    bgc = bgc_df.copy() if bgc_df is not None else pd.DataFrame()

    # Validate columns
    for name, df in (("core", core), ("bgc", bgc)):
        if not df.empty and not {"latitude", "longitude", "date"}.issubset(df.columns):
            raise ValueError(f"{name}_df must contain 'latitude','longitude','date' columns")

    # Normalize longitudes
    if normalize_longitudes:
        if not core.empty:
            core["longitude"] = _normalize_longitudes_array(core["longitude"])
        if not bgc.empty:
            bgc["longitude"] = _normalize_longitudes_array(bgc["longitude"])

    # Interpret bbox order
    if bbox_order == "lonlat":
        canonical_bbox = [bbox[0], bbox[1], bbox[2], bbox[3]]
    elif bbox_order == "latlon":
        canonical_bbox = [bbox[1], bbox[0], bbox[3], bbox[2]]
    else:
        canonical_bbox = _auto_detect_bbox_order([core, bgc], bbox)

    # Time filter
    start_ts, end_ts = pd.to_datetime(start_date), pd.to_datetime(end_date)

    def _time_filter(df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        return df[(df["date"] >= start_ts) & (df["date"] <= end_ts)].reset_index(drop=True)

    core, bgc = _time_filter(core), _time_filter(bgc)

    # Spatial filter
    def _spatial_filter(df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df
        mask = _bbox_contains_points(df["latitude"], df["longitude"], canonical_bbox)
        return df[mask].reset_index(drop=True)

    core, bgc = _spatial_filter(core), _spatial_filter(bgc)

    # Parameter filter (BGC only)
    if required_params and not bgc.empty and "parameters" in bgc.columns:
        parms = bgc["parameters"].fillna("").astype(str)
        mask = np.ones(len(parms), dtype=bool)
        for tok in required_params:
            tok = str(tok).strip()
            if not tok:
                continue
            mask &= parms.str.contains(rf"\b{re.escape(tok)}\b", case=False, na=False)
        bgc = bgc[mask].reset_index(drop=True)

    if not core.empty:
        core = core.assign(source="core")
    if not bgc.empty:
        bgc = bgc.assign(source="bgc")

    combined = pd.concat([core, bgc], ignore_index=True, sort=False)
    if combined.empty:
        print("No profiles found.")
        return combined

    print(f"Profiles before sampling: {len(combined)}")

    if downsample:
        combined = adaptive_temporal_sampler(combined, time_col="date", samples_per_bin=samples_per_bin)
        print(f"Profiles after sampling: {len(combined)}")

    return combined.reset_index(drop=True)


# -----------------------
# LLM payload adapter
# -----------------------
def _coerce_dates_from_llm(td: Any) -> Tuple[str, str]:
    """
    Accepts:
      - {"start_time": "YYYY-MM-DD", "end_time": "YYYY-MM-DD"} OR
      - ["YYYY-MM-DD", "YYYY-MM-DD"]
    Returns ISO strings (start_date, end_date) with start <= end.
    Fallback: last 365 days ending today.
    """
    try:
        if isinstance(td, dict):
            start = pd.to_datetime(td.get("start_time"), errors="coerce")
            end = pd.to_datetime(td.get("end_time"), errors="coerce")
        elif isinstance(td, (list, tuple)) and len(td) == 2:
            start = pd.to_datetime(td[0], errors="coerce")
            end = pd.to_datetime(td[1], errors="coerce")
        else:
            start = end = pd.NaT
    except Exception:
        start = end = pd.NaT

    if pd.isna(start) or pd.isna(end):
        end = pd.Timestamp.today().normalize()
        start = end - pd.Timedelta(days=365)

    if start > end:
        start, end = end, start

    return start.date().isoformat(), end.date().isoformat()


def _coerce_bbox_from_llm(bbox: Any) -> List[float]:
    """
    Ensure bbox is [min_lon, max_lon, min_lat, max_lat] as floats.
    """
    if not isinstance(bbox, (list, tuple)) or len(bbox) < 4:
        raise ValueError("bbox must be a list of 4 numbers [min_lon, max_lon, min_lat, max_lat]")
    return [float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])]


def _coerce_params_from_llm(params: Any) -> List[str]:
    if params is None:
        return []
    if isinstance(params, str):
        return [p.strip() for p in params.split(",") if p.strip()]
    if isinstance(params, (list, tuple)):
        return [str(p).strip() for p in params if str(p).strip()]
    return []


def select_from_llm_payload(
    core_df: pd.DataFrame,
    bgc_df: pd.DataFrame,
    llm_payload: Dict[str, Any],
    *,
    normalize_longitudes: bool = True,
    bbox_order: str = "auto",
    downsample: bool = True,
    samples_per_bin: int = 3,
) -> pd.DataFrame:
    """
    Map llm_handler.process_query(...) output to process_and_filter_profiles inputs.

    Expects llm_payload like:
    {
      "time_duration": {"start_time": "YYYY-MM-DD", "end_time": "YYYY-MM-DD"} OR ["YYYY-MM-DD","YYYY-MM-DD"],
      "parameters": ["Salinity","pressure"],
      "depth": "0-200m",   # optional here
      "bbox": [-95, -75, 51, 64]
    }
    """
    td = llm_payload.get("time_duration")
    bbox_in = llm_payload.get("bbox")
    params_in = llm_payload.get("parameters")

    start_date, end_date = _coerce_dates_from_llm(td)
    bbox = _coerce_bbox_from_llm(bbox_in)
    required_params = _coerce_params_from_llm(params_in)

    return process_and_filter_profiles(
        core_df=core_df,
        bgc_df=bgc_df,
        bbox=bbox,
        start_date=start_date,
        end_date=end_date,
        required_params=required_params,
        normalize_longitudes=normalize_longitudes,
        bbox_order=bbox_order,
        downsample=downsample,
        samples_per_bin=samples_per_bin,
    )