# import streamlit as st
# import requests
# import pandas as pd
# from io import StringIO

# url = "http://127.0.0.1:8000/data_csv"
# response = requests.get(url)

# df = pd.read_csv(StringIO(response.text))
# st.dataframe(df)




# import io
# import requests
# import pandas as pd
# import numpy as np
# import plotly.express as px
# import streamlit as st

# st.set_page_config(page_title="Argo Profiles Viewer", layout="wide")

# API_URL_DEFAULT = "http://127.0.0.1:8000/data_csv"

# @st.cache_data(ttl=300)
# def fetch_csv(url: str) -> pd.DataFrame:
#     r = requests.get(url, timeout=60)
#     r.raise_for_status()
#     df = pd.read_csv(io.StringIO(r.text))
#     # Basic cleaning
#     if "date" in df.columns:
#         df["date"] = pd.to_datetime(df["date"], errors="coerce")
#     # Ensure numeric lat/lon
#     if "latitude" in df.columns:
#         df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
#     if "longitude" in df.columns:
#         df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
#     # Drop invalid coords
#     if {"latitude", "longitude"}.issubset(df.columns):
#         df = df[np.isfinite(df["latitude"]) & np.isfinite(df["longitude"])]
#     return df.reset_index(drop=True)

# st.title("Argo Profiles (CSV via FastAPI)")

# # Backend URL
# with st.sidebar:
#     st.header("Data Source")
#     api_url = st.text_input("FastAPI CSV URL", API_URL_DEFAULT)
#     st.caption("Backend file served from filtered_profiles.csv")

# # Load data
# try:
#     df = fetch_csv(api_url)
# except Exception as e:
#     st.error(f"Failed to fetch CSV: {e}")
#     st.stop()

# if df.empty:
#     st.warning("No data found.")
#     st.stop()

# # Sidebar filters
# with st.sidebar:
#     st.header("Filters")
#     # Date range
#     if "date" in df.columns and df["date"].notna().any():
#         min_d = pd.to_datetime(df["date"].min()).date()
#         max_d = pd.to_datetime(df["date"].max()).date()
#         dr = st.date_input("Date range", value=(min_d, max_d))
#         if isinstance(dr, tuple) and len(dr) == 2:
#             start_date, end_date = pd.to_datetime(dr[0]), pd.to_datetime(dr[1])
#             df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]
#     # Ocean filter
#     if "ocean" in df.columns:
#         oceans = sorted([x for x in df["ocean"].dropna().unique().tolist()])
#         sel_oceans = st.multiselect("Ocean", oceans, default=oceans)
#         if sel_oceans:
#             df = df[df["ocean"].isin(sel_oceans)]
#     # Institution
#     if "institution" in df.columns:
#         insts = sorted([x for x in df["institution"].dropna().unique().tolist()])
#         sel_insts = st.multiselect("Institution", insts, default=insts[:10] if len(insts) > 10 else insts)
#         if sel_insts:
#             df = df[df["institution"].isin(sel_insts)]
#     # Source
#     if "source" in df.columns:
#         sources = sorted([x for x in df["source"].dropna().unique().tolist()])
#         sel_sources = st.multiselect("Source", sources, default=sources)
#         if sel_sources:
#             df = df[df["source"].isin(sel_sources)]
#     # Profiler type
#     if "profiler_type" in df.columns:
#         types_ = sorted([x for x in df["profiler_type"].dropna().unique().tolist()])
#         sel_types = st.multiselect("Profiler Type", types_, default=types_)
#         if sel_types:
#             df = df[df["profiler_type"].isin(sel_types)]

# # Empty after filters?
# if df.empty:
#     st.warning("No rows after filtering.")
#     st.stop()

# # Top row: map
# st.subheader("Profile Locations")
# if {"latitude", "longitude"}.issubset(df.columns):
#     color_col = "ocean" if "ocean" in df.columns else ("source" if "source" in df.columns else None)
#     hover_cols = [c for c in ["file", "date", "institution", "profiler_type", "source", "ocean"] if c in df.columns]
#     fig_map = px.scatter_geo(
#         df,
#         lat="latitude",
#         lon="longitude",
#         color=color_col,
#         hover_name="file" if "file" in df.columns else None,
#         hover_data=hover_cols,
#         title=None,
#         projection="natural earth",
#     )
#     fig_map.update_geos(
#         showland=True, landcolor="#ECECEC",
#         showocean=True, oceancolor="#A8DADC",
#         showcountries=True, countrycolor="rgba(0,0,0,0.25)"
#     )
#     fig_map.update_traces(marker=dict(size=6, opacity=0.8))
#     st.plotly_chart(fig_map, use_container_width=True)
# else:
#     st.info("CSV has no latitude/longitude columns to plot on map.")

# # Middle row: time series (monthly counts)
# if "date" in df.columns and df["date"].notna().any():
#     st.subheader("Profiles Over Time")
#     monthly = (
#         df.assign(month=pd.to_datetime(df["date"]).dt.to_period("M").dt.to_timestamp())
#           .groupby("month")
#           .size()
#           .reset_index(name="count")
#     )
#     fig_time = px.bar(monthly, x="month", y="count", title=None)
#     fig_time.update_layout(xaxis_title="Month", yaxis_title="Profiles")
#     st.plotly_chart(fig_time, use_container_width=True)

# # Bottom row: top institutions
# if "institution" in df.columns:
#     st.subheader("Top Institutions")
#     top_n = st.slider("Show top N", min_value=5, max_value=30, value=10, step=1)
#     inst_counts = df["institution"].fillna("Unknown").value_counts().nlargest(top_n).reset_index()
#     inst_counts.columns = ["institution", "count"]
#     fig_inst = px.bar(inst_counts, x="institution", y="count", title=None)
#     fig_inst.update_layout(xaxis_title="Institution", yaxis_title="Profiles")
#     st.plotly_chart(fig_inst, use_container_width=True)

# # Data preview + download
# st.subheader("Data Preview")
# st.dataframe(df.head(200))

# csv_buf = io.StringIO()
# df.to_csv(csv_buf, index=False)
# st.download_button("Download filtered CSV", data=csv_buf.getvalue().encode("utf-8"),
#                    file_name="filtered_profiles_filtered.csv", mime="text/csv")





import io
import requests
import pandas as pd
import numpy as np
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Argo Profiles Viewer", layout="wide")

POST_URL_DEFAULT = "http://127.0.0.1:8000/chat-response"
GET_URL_DEFAULT = "http://127.0.0.1:8000/data_csv"

# Initialize session state
if "filters_ready" not in st.session_state:
    st.session_state["filters_ready"] = False
if "df" not in st.session_state:
    st.session_state["df"] = None

@st.cache_data(ttl=300)
def fetch_csv(url: str) -> pd.DataFrame:
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    df = pd.read_csv(io.StringIO(r.text))
    # Basic cleaning
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    # Ensure numeric lat/lon
    if "latitude" in df.columns:
        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    if "longitude" in df.columns:
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    # Drop invalid coords
    if {"latitude", "longitude"}.issubset(df.columns):
        df = df[np.isfinite(df["latitude"]) & np.isfinite(df["longitude"])]
    return df.reset_index(drop=True)

def post_filters(url: str, query: str) -> dict:
    r = requests.post(url, json={"query": query}, timeout=60)
    r.raise_for_status()
    return r.json()

st.title("AI Based Argo Profiles Viewer")

with st.sidebar:
    st.header("Backend URLs")
    post_url = st.text_input("POST /chat-response URL", POST_URL_DEFAULT)
    get_url = st.text_input("GET /data_csv URL", GET_URL_DEFAULT)

    st.header("Query")
    query = st.text_area(
        "Enter You Query",
        value="give the salinity, temperature of Bay of Bengal for last year",
        height=110
    )
    if st.button("Apply filters (POST)"):
        if not query.strip():
            st.error("Please enter a query.")
        else:
            try:
                resp = post_filters(post_url, query.strip())
                st.success("Filters applied. Fetching your Argo Profiles...")
                st.session_state["filters_ready"] = True
                # Immediately fetch data after successful POST
                df = fetch_csv(get_url)
                st.session_state["df"] = df
            except Exception as e:
                st.session_state["filters_ready"] = False
                st.session_state["df"] = None
                st.error(f"POST failed: {e}")

    # Manual fetch button (optional)
    if st.session_state.get("filters_ready", False):
        if st.button("Fetch CSV (GET)"):
            try:
                df = fetch_csv(get_url)
                st.session_state["df"] = df
                st.success(f"Fetched {len(df)} rows.")
            except Exception as e:
                st.error(f"GET failed: {e}")

# Do not auto-call GET until POST succeeded
df = st.session_state.get("df")
if not st.session_state.get("filters_ready", False):
    st.info("Submit your Query to fetch the Argo Profiles.")
    st.stop()

if df is None or df.empty:
    st.warning("No data yet. Click 'Fetch CSV (GET)' after applying filters.")
    st.stop()

# Sidebar filters (apply to already-fetched df)
with st.sidebar:
    st.header("Filters")
    # Date range
    if "date" in df.columns and df["date"].notna().any():
        min_d = pd.to_datetime(df["date"].min()).date()
        max_d = pd.to_datetime(df["date"].max()).date()
        dr = st.date_input("Date range", value=(min_d, max_d))
        if isinstance(dr, tuple) and len(dr) == 2:
            start_date, end_date = pd.to_datetime(dr[0]), pd.to_datetime(dr[1])
            df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]
    # Ocean filter
    if "ocean" in df.columns:
        oceans = sorted([x for x in df["ocean"].dropna().unique().tolist()])
        sel_oceans = st.multiselect("Ocean", oceans, default=oceans)
        if sel_oceans:
            df = df[df["ocean"].isin(sel_oceans)]
    # Institution
    if "institution" in df.columns:
        insts = sorted([x for x in df["institution"].dropna().unique().tolist()])
        sel_insts = st.multiselect("Institution", insts, default=insts[:10] if len(insts) > 10 else insts)
        if sel_insts:
            df = df[df["institution"].isin(sel_insts)]
    # Source
    if "source" in df.columns:
        sources = sorted([x for x in df["source"].dropna().unique().tolist()])
        sel_sources = st.multiselect("Source", sources, default=sources)
        if sel_sources:
            df = df[df["source"].isin(sel_sources)]
    # Profiler type
    if "profiler_type" in df.columns:
        types_ = sorted([x for x in df["profiler_type"].dropna().unique().tolist()])
        sel_types = st.multiselect("Profiler Type", types_, default=types_)
        if sel_types:
            df = df[df["profiler_type"].isin(sel_types)]

# Empty after filters?
if df.empty:
    st.warning("No rows after filtering.")
    st.stop()

# Map
st.subheader("Profile Locations")
if {"latitude", "longitude"}.issubset(df.columns):
    color_col = "ocean" if "ocean" in df.columns else ("source" if "source" in df.columns else None)
    hover_cols = [c for c in ["file", "date", "institution", "profiler_type", "source", "ocean"] if c in df.columns]
    fig_map = px.scatter_geo(
        df,
        lat="latitude",
        lon="longitude",
        color=color_col,
        hover_name="file" if "file" in df.columns else None,
        hover_data=hover_cols,
        title=None,
        projection="natural earth",
    )
    fig_map.update_geos(
        showland=True, landcolor="#ECECEC",
        showocean=True, oceancolor="#A8DADC",
        showcountries=True, countrycolor="rgba(0,0,0,0.25)"
    )
    fig_map.update_traces(marker=dict(size=6, opacity=0.8))
    st.plotly_chart(fig_map, use_container_width=True)
else:
    st.info("CSV has no latitude/longitude columns to plot on map.")

# Time series
if "date" in df.columns and df["date"].notna().any():
    st.subheader("Profiles Over Time")
    monthly = (
        df.assign(month=pd.to_datetime(df["date"]).dt.to_period("M").dt.to_timestamp())
          .groupby("month")
          .size()
          .reset_index(name="count")
    )
    fig_time = px.bar(monthly, x="month", y="count", title=None)
    fig_time.update_layout(xaxis_title="Month", yaxis_title="Profiles")
    st.plotly_chart(fig_time, use_container_width=True)

# Institutions
if "institution" in df.columns:
    st.subheader("Top Institutions")
    top_n = st.slider("Show top N", min_value=5, max_value=30, value=10, step=1)
    inst_counts = df["institution"].fillna("Unknown").value_counts().nlargest(top_n).reset_index()
    inst_counts.columns = ["institution", "count"]
    fig_inst = px.bar(inst_counts, x="institution", y="count", title=None)
    fig_inst.update_layout(xaxis_title="Institution", yaxis_title="Profiles")
    st.plotly_chart(fig_inst, use_container_width=True)

# Data preview + download
st.subheader("Data Preview")
st.dataframe(df.head(200))

csv_buf = io.StringIO()
df.to_csv(csv_buf, index=False)
st.download_button("Download filtered CSV", data=csv_buf.getvalue().encode("utf-8"),
                   file_name="filtered_profiles_filtered.csv", mime="text/csv")