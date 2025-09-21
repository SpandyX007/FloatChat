import io
import requests
import pandas as pd
import numpy as np
import plotly.express as px
import dash
from dash import dcc, html, Input, Output, State, no_update

API_URL_DEFAULT = "http://127.0.0.1:8000/data_csv"

app = dash.Dash(__name__, suppress_callback_exceptions=True)
server = app.server

def df_from_csv_text(csv_text: str) -> pd.DataFrame:
    if not csv_text.strip():
        return pd.DataFrame()
    df = pd.read_csv(io.StringIO(csv_text))
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    if "latitude" in df.columns:
        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    if "longitude" in df.columns:
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    if {"latitude", "longitude"}.issubset(df.columns):
        df = df[np.isfinite(df["latitude"]) & np.isfinite(df["longitude"])]
    return df.reset_index(drop=True)

def df_filter(df: pd.DataFrame, start_date, end_date, oceans, insts, sources, types_):
    if df is None or df.empty:
        return df
    out = df.copy()
    if "date" in out.columns and start_date and end_date:
        out = out[(out["date"] >= pd.to_datetime(start_date)) & (out["date"] <= pd.to_datetime(end_date))]
    if oceans and "ocean" in out.columns:
        out = out[out["ocean"].isin(oceans)]
    if insts and "institution" in out.columns:
        out = out[out["institution"].isin(insts)]
    if sources and "source" in out.columns:
        out = out[out["source"].isin(sources)]
    if types_ and "profiler_type" in out.columns:
        out = out[out["profiler_type"].isin(types_)]
    return out.reset_index(drop=True)

def fig_map_osm(df: pd.DataFrame):
    if df is None or df.empty or not {"latitude", "longitude"}.issubset(df.columns):
        return px.scatter_map()
    color_col = "ocean" if "ocean" in df.columns else ("source" if "source" in df.columns else None)
    hover_cols = [c for c in ["file", "date", "institution", "profiler_type", "source", "ocean"] if c in df.columns]
    center = {"lat": float(df["latitude"].mean()), "lon": float(df["longitude"].mean())}
    fig = px.scatter_map(
        df,
        lat="latitude",
        lon="longitude",
        color=color_col,
        hover_name="file" if "file" in df.columns else None,
        hover_data=hover_cols,
        zoom=1,
        center=center,
        height=600,
    )
    fig.update_traces(marker={"size": 7, "opacity": 0.85})
    fig.update_layout(mapbox_style="open-street-map", margin=dict(l=10, r=10, t=40, b=10))
    return fig

def fig_monthly_counts(df: pd.DataFrame):
    if df is None or df.empty or "date" not in df.columns or df["date"].isna().all():
        return px.bar()
    monthly = (
        df.assign(month=pd.to_datetime(df["date"]).dt.to_period("M").dt.to_timestamp())
          .groupby("month").size()
          .reset_index(name="count")
    )
    fig = px.bar(monthly, x="month", y="count", title=None)
    fig.update_layout(margin=dict(l=10, r=10, t=40, b=10), xaxis_title="Month", yaxis_title="Profiles")
    return fig

def fig_top_institutions(df: pd.DataFrame, top_n=10):
    if df is None or df.empty or "institution" not in df.columns:
        return px.bar()
    inst_counts = df["institution"].fillna("Unknown").value_counts().nlargest(top_n).reset_index()
    inst_counts.columns = ["institution", "count"]
    fig = px.bar(inst_counts, x="institution", y="count", title=None)
    fig.update_layout(margin=dict(l=10, r=10, t=40, b=10), xaxis_title="Institution", yaxis_title="Profiles")
    return fig

def mk_options(series: pd.Series):
    vals = sorted([v for v in series.dropna().unique().tolist()])
    return [{"label": str(v), "value": v} for v in vals]

app.layout = html.Div(className="app", children=[
    html.Div(className="controls", style={"padding": "12px", "background": "#f5f7fb", "borderBottom": "1px solid #e5e7eb"}, children=[
        html.Div(style={"display": "flex", "gap": "8px", "alignItems": "center", "flexWrap": "wrap"}, children=[
            html.Div(children=[
                html.Label("FastAPI CSV URL"),
                dcc.Input(id="api-url", type="text", value=API_URL_DEFAULT, style={"width": "420px"})
            ]),
            html.Button("Fetch", id="fetch-btn", n_clicks=0, style={"height": "36px"}),
            html.Div(id="fetch-status", style={"color": "#6b7280"}),
        ]),
        html.Hr(),
        html.Div(style={"display": "grid", "gridTemplateColumns": "repeat(5, 1fr)", "gap": "10px"}, children=[
            html.Div(children=[
                html.Label("Date range"),
                dcc.DatePickerRange(id="date-range"),
            ]),
            html.Div(children=[
                html.Label("Ocean"),
                dcc.Dropdown(id="filter-ocean", multi=True, placeholder="All")
            ]),
            html.Div(children=[
                html.Label("Institution"),
                dcc.Dropdown(id="filter-inst", multi=True, placeholder="All")
            ]),
            html.Div(children=[
                html.Label("Source"),
                dcc.Dropdown(id="filter-source", multi=True, placeholder="All")
            ]),
            html.Div(children=[
                html.Label("Profiler Type"),
                dcc.Dropdown(id="filter-type", multi=True, placeholder="All")
            ]),
        ]),
        html.Div(style={"marginTop": "8px"}, children=[
            html.Button("Download filtered CSV", id="dl-btn", n_clicks=0),
            dcc.Download(id="dl-csv")
        ]),
        dcc.Store(id="raw-data"),
        dcc.Store(id="filtered-data"),
    ]),
    html.Div(className="content", style={"padding": "12px"}, children=[
        html.Div(style={"display": "grid", "gridTemplateColumns": "2fr 1fr", "gap": "12px"}, children=[
            html.Div(children=[
                html.H3("Profile Locations (OpenStreetMap)"),
                dcc.Graph(id="map-fig")
            ]),
            html.Div(children=[
                html.H3("Profiles Over Time"),
                dcc.Graph(id="time-fig"),
                html.H3("Top Institutions"),
                dcc.Graph(id="inst-fig"),
            ])
        ])
    ])
])

@app.callback(
    [
        Output("raw-data", "data"),
        Output("fetch-status", "children"),
        Output("date-range", "min_date_allowed"),
        Output("date-range", "max_date_allowed"),
        Output("date-range", "start_date"),
        Output("date-range", "end_date"),
        Output("filter-ocean", "options"),
        Output("filter-inst", "options"),
        Output("filter-source", "options"),
        Output("filter-type", "options"),
        Output("filter-ocean", "value"),
        Output("filter-inst", "value"),
        Output("filter-source", "value"),
        Output("filter-type", "value"),
    ],
    Input("fetch-btn", "n_clicks"),
    State("api-url", "value"),
    prevent_initial_call=True
)
def fetch_data(n_clicks, api_url):
    try:
        r = requests.get(api_url, timeout=60)
        r.raise_for_status()
        df = df_from_csv_text(r.text)
        if df.empty:
            return None, "No data returned.", None, None, None, None, [], [], [], [], [], [], [], []
        # Date bounds
        min_d = max_d = start_d = end_d = None
        if "date" in df.columns and df["date"].notna().any():
            min_d = pd.to_datetime(df["date"].min()).date()
            max_d = pd.to_datetime(df["date"].max()).date()
            start_d, end_d = min_d, max_d
        # Options
        ocean_opts = mk_options(df["ocean"]) if "ocean" in df.columns else []
        inst_opts = mk_options(df["institution"]) if "institution" in df.columns else []
        source_opts = mk_options(df["source"]) if "source" in df.columns else []
        type_opts = mk_options(df["profiler_type"]) if "profiler_type" in df.columns else []
        return (
            df.to_dict("records"),
            f"Fetched {len(df)} rows.",
            min_d, max_d, start_d, end_d,
            ocean_opts, inst_opts, source_opts, type_opts,
            [o["value"] for o in ocean_opts],  # default select all
            [i["value"] for i in inst_opts][:10] if len(inst_opts) > 10 else [i["value"] for i in inst_opts],
            [s["value"] for s in source_opts],
            [t["value"] for t in type_opts],
        )
    except Exception as e:
        return None, f"Error: {e}", None, None, None, None, [], [], [], [], [], [], [], []

@app.callback(
    [
        Output("filtered-data", "data"),
        Output("map-fig", "figure"),
        Output("time-fig", "figure"),
        Output("inst-fig", "figure"),
    ],
    [
        Input("raw-data", "data"),
        Input("date-range", "start_date"),
        Input("date-range", "end_date"),
        Input("filter-ocean", "value"),
        Input("filter-inst", "value"),
        Input("filter-source", "value"),
        Input("filter-type", "value"),
    ],
    prevent_initial_call=True
)
def filter_and_plot(data, start_date, end_date, oceans, insts, sources, types_):
    if not data:
        return None, px.scatter_map(), px.bar(), px.bar()
    df = pd.DataFrame(data)
    # Re-coerce types (stores lose dtypes)
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    for col in ("latitude", "longitude"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df_filter(df, start_date, end_date, oceans, insts, sources, types_)
    return (
        df.to_dict("records"),
        fig_map_osm(df),
        fig_monthly_counts(df),
        fig_top_institutions(df),
    )

@app.callback(
    Output("dl-csv", "data"),
    Input("dl-btn", "n_clicks"),
    State("filtered-data", "data"),
    prevent_initial_call=True
)
def download_filtered(n, data):
    if not data:
        return no_update
    df = pd.DataFrame(data)
    buf = io.StringIO()
    # Convert datetimes for CSV
    for c in df.columns:
        if np.issubdtype(df[c].dtype, np.datetime64):
            df[c] = pd.to_datetime(df[c], errors="coerce").dt.strftime("%Y-%m-%dT%H:%M:%S")
    df.to_csv(buf, index=False)
    return dict(content=buf.getvalue(), filename="filtered_profiles_filtered.csv", type="text/csv")

if __name__ == "__main__":
    app.run(debug=True, port=8051, use_reloader=False)