import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import math
import geopandas as gpd
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from datetime import datetime
import re

# -----------------------
# Helper utilities
# -----------------------
def _normalize_longitudes_array(lons: np.ndarray) -> np.ndarray:
    """Convert longitudes > 180 into [-180, 180] range."""
    lons = np.asarray(lons, dtype="float64")
    mask = np.isfinite(lons) & (lons > 180)
    lons[mask] -= 360.0
    return lons

def _bbox_contains_points(lat, lon, bbox):
    """Check whether (lat, lon) points fall inside bbox = [lon_min, lon_max, lat_min, lat_max]."""
    lon_min, lon_max, lat_min, lat_max = bbox
    lon = np.asarray(lon, dtype="float64")
    lat = np.asarray(lat, dtype="float64")

    if lon_min <= lon_max:
        lon_mask = (lon >= lon_min) & (lon <= lon_max)
    else:  # handle dateline crossing
        lon_mask = (lon >= lon_min) | (lon <= lon_max)
    lat_mask = (lat >= lat_min) & (lat <= lat_max)
    return lon_mask & lat_mask

def _auto_detect_bbox_order(df_list, bbox):
    """Detect whether bbox is lon-lat or lat-lon based on which fits more points."""
    if len(bbox) != 4:
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
def adaptive_temporal_sampler(df, time_col="date", samples_per_bin=3):
    """
    Downsample profiles:
      - Splits dataset into temporal bins (weekly, fortnightly, monthly, yearly).
      - From each bin, picks up to `samples_per_bin` spatially diverse profiles via KMeans.
    """
    if df.empty:
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

    sampled_indices = []
    coords_cols = ["latitude", "longitude"]

    for i in range(len(periods) - 1):
        s, e = periods[i], periods[i + 1]
        win = df[(df[time_col] >= s) & (df[time_col] < e)]
        if win.empty:
            continue

        n_clusters = min(samples_per_bin, len(win))
        if n_clusters == 1:
            sampled_indices.append(win.index[0])
            continue

        coords = win[coords_cols].to_numpy(dtype="float64")
        kmeans = KMeans(n_clusters=n_clusters, random_state=0, n_init=4)
        labels = kmeans.fit_predict(coords)
        centers = kmeans.cluster_centers_

        for cid in range(n_clusters):
            mask = labels == cid
            if not np.any(mask):
                continue
            idxs = win.index.to_numpy()[mask]
            cluster_coords = coords[mask]
            d2 = np.sum((cluster_coords - centers[cid]) ** 2, axis=1)
            sampled_indices.append(idxs[np.argmin(d2)])

    return df.loc[sampled_indices].drop_duplicates().reset_index(drop=True)

# -----------------------
# Main pipeline
# -----------------------
def process_and_filter_profiles(
    core_df: pd.DataFrame,
    bgc_df: pd.DataFrame,
    bbox,
    start_date,
    end_date,
    required_params=None,
    normalize_longitudes=True,
    bbox_order="auto",
    downsample=True,
    samples_per_bin=3,
):
    """
    Process and filter Argo profile metadata:
      - Time + spatial bbox filter
      - Optional param filter for BGC
      - Optional temporal-spatial downsampling
    """
    core = core_df.copy() if core_df is not None else pd.DataFrame()
    bgc = bgc_df.copy() if bgc_df is not None else pd.DataFrame()

    # validate required columns
    for name, df in (("core", core), ("bgc", bgc)):
        if not df.empty and not {"latitude", "longitude", "date"}.issubset(df.columns):
            raise ValueError(f"{name}_df must contain 'latitude','longitude','date' columns")

    # normalize longitudes
    if normalize_longitudes:
        if not core.empty:
            core["longitude"] = _normalize_longitudes_array(core["longitude"])
        if not bgc.empty:
            bgc["longitude"] = _normalize_longitudes_array(bgc["longitude"])

    # interpret bbox
    if bbox_order == "lonlat":
        canonical_bbox = [bbox[0], bbox[1], bbox[2], bbox[3]]
    elif bbox_order == "latlon":
        canonical_bbox = [bbox[1], bbox[0], bbox[3], bbox[2]]
    else:
        canonical_bbox = _auto_detect_bbox_order([core, bgc], bbox)

    # time filter
    start_ts, end_ts = pd.to_datetime(start_date), pd.to_datetime(end_date)

    def _time_filter(df):
        if df.empty:
            return df
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        return df[(df["date"] >= start_ts) & (df["date"] <= end_ts)].reset_index(drop=True)

    core, bgc = _time_filter(core), _time_filter(bgc)

    # spatial filter
    def _spatial_filter(df):
        if df.empty:
            return df
        mask = _bbox_contains_points(df["latitude"], df["longitude"], canonical_bbox)
        return df[mask].reset_index(drop=True)

    core, bgc = _spatial_filter(core), _spatial_filter(bgc)

    # param filter (bgc only)
    # if required_params and not bgc.empty:
    #     parms = bgc["parameters"].fillna("").astype(str)
    #     mask = np.ones(len(parms), dtype=bool)
    #     for tok in required_params:
    #         if not tok:
    #             continue
    #         mask &= parms.str.contains(rf"\b{pd.util.escape_regex(tok)}\b", case=False, na=False)
    #     bgc = bgc[mask].reset_index(drop=True)
    if required_params and not bgc.empty and "parameters" in bgc.columns:
        parms = bgc["parameters"].fillna("").astype(str)
        mask = np.ones(len(parms), dtype=bool)
        for tok in required_params:
            tok = str(tok).strip()
            if not tok:
                continue
            escaped = re.escape(tok)
            mask &= parms.str.contains(rf"\b{escaped}\b", case=False, na=False, regex=True)
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



# core = pd.read_csv(r"D:\BMSIT College Docs\SEM5\MiniProject\FloatChat\backend\api\argo_core.csv")

# bgc = pd.read_csv(r"D:\BMSIT College Docs\SEM5\MiniProject\FloatChat\backend\api\argo_bgc.csv")


# final_df = process_and_filter_profiles(core_df=core, bgc_df=bgc,bbox=[80.0,100.0,5.0,22.0],start_date="2015-01-01",end_date="2018-01-01",samples_per_bin=3)

# print(final_df)