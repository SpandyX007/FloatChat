# from typing import List, TypedDict
# import dash
# from dash import dcc, html, Input, Output, no_update
# import plotly.express as px
# import plotly.graph_objects as go
# from get_argo import load_argo_data
# import numpy as np  # ADD

# class DropdownOption(TypedDict):
#     label: str
#     value: str

# print("Loading Argo data...")
# all_data = load_argo_data()
# print(f"\nDEBUG: Loaded {len(all_data)} profiles")
# for i, d in enumerate(all_data):
#     print(f"Profile {i}: {d.get('file')}")

# def make_labels() -> List[str]:
#     return [f"{i}|{str(d.get('file', f'Profile {i}'))}" for i, d in enumerate(all_data)]

# def make_options(labels: List[str]) -> List[DropdownOption]:
#     return [{"label": lbl, "value": lbl} for lbl in labels]

# def parse_index(label: str) -> int:
#     try:
#         return int(label.split("|", 1)[0])
#     except Exception:
#         return -1

# labels = make_labels()
# options: List[DropdownOption] = make_options(labels)

# app = dash.Dash(__name__, suppress_callback_exceptions=True)

# app.index_string = """
# <!DOCTYPE html>
# <html>
#   <head>
#     {%metas%}
#     <title>Argo Float Profile Viewer</title>
#     {%favicon%}
#     {%css%}
#   </head>
#   <body>
#     {%app_entry%}
#     <footer>
#       {%config%}
#       {%scripts%}
#       {%renderer%}
#     </footer>
#   </body>
# </html>
# """

# # ...existing code...
# app.layout = html.Div(className="app", children=[
#     html.Div(className="header", children=[
#         html.H1("Argo Float Profile Viewer", className="title"),
#         html.P("Explore temperature, salinity, and depth profiles from Argo floats.", className="subtitle")
#     ]),

#     html.Div(className="controls card", children=[
#         html.H3("Controls"),
#         html.Label("Select Profile:", style={'fontWeight': '700'}),
#         dcc.Dropdown(
#             id='profile-dropdown',
#             className='pretty-dropdown',
#             options=options,
#             value=labels[0] if labels else None,
#             clearable=False,
#             placeholder="Select a profile...",
#             persistence=True,
#             persistence_type='memory',
#             style={'marginTop': '8px'}
#         )
#     ]),

#     html.Div(className="grid", children=[
#         html.Div(className="card figure-card", children=[
#             html.H3("Location"),
#             dcc.Graph(
#                 id='map-plot',
#                 config={'displayModeBar': False, 'responsive': True},
#                 style={'height': '40vh', 'minHeight': '320px', 'width': '100%'}  # bounded, responsive
#             )
#         ]),
#         html.Div(className="card figure-card", children=[
#             html.H3("Temperature Profile"),
#             dcc.Graph(
#                 id='temp-profile',
#                 config={'displayModeBar': False, 'responsive': True},
#                 style={'height': '40vh', 'minHeight': '320px', 'width': '100%'}
#             )
#         ]),
#         html.Div(className="card figure-card", children=[
#             html.H3("Salinity Profile"),
#             dcc.Graph(
#                 id='salinity-profile',
#                 config={'displayModeBar': False, 'responsive': True},
#                 style={'height': '40vh', 'minHeight': '320px', 'width': '100%'}
#             )
#         ]),
#         html.Div(className="card figure-card", children=[
#             html.H3("T–S Diagram"),
#             dcc.Graph(
#                 id='temp-salinity-scatter',
#                 config={'displayModeBar': False, 'responsive': True},
#                 style={'height': '40vh', 'minHeight': '320px', 'width': '100%'}
#             )
#         ]),
#     ]),

#     html.Div(className="footer-note", children=f"Loaded {len(all_data)} profiles")
# ])

# def _style_fig(fig, title):
#     fig.update_layout(
#         title=title,
#         template='plotly_dark',
#         paper_bgcolor='rgba(0,0,0,0)',
#         plot_bgcolor='rgba(0,0,0,0)',
#         font=dict(color='#e5e7eb'),
#         margin=dict(l=8, r=8, t=40, b=8),
#         title_font=dict(size=16, color='#e5e7eb', family='Segoe UI, Roboto, Arial'),
#         autosize=True  # let it fit Graph container
#         # height removed to avoid overflow
#     )
#     return fig
# # ...existing code...

# def _clean_profile(data):
#     """Return finite, clipped arrays (pressure[dbar], temperature, salinity)."""
#     p = np.asarray(data.get('pressure', []), dtype=float).flatten()
#     t = np.asarray(data.get('temperature', []), dtype=float).flatten()
#     s = np.asarray(data.get('salinity', []), dtype=float).flatten()
#     m = np.isfinite(p) & np.isfinite(t) & np.isfinite(s)
#     p, t, s = p[m], t[m], s[m]
#     # clip to reasonable range to avoid runaway axes
#     p = np.clip(p, 0, 6000)
#     return p, t, s

# @app.callback(
#     [Output('map-plot', 'figure'),
#      Output('temp-profile', 'figure'),
#      Output('salinity-profile', 'figure'),
#      Output('temp-salinity-scatter', 'figure')],
#     [Input('profile-dropdown', 'value')]
# )
# def update_plots(selected_label: str):
#     if selected_label is None or not all_data:
#         empty = go.Figure()
#         for f in (empty, empty, empty, empty):
#             _style_fig(f, "")
#         return empty, empty, empty, empty

#     idx = parse_index(selected_label)
#     if idx < 0 or idx >= len(all_data):
#         return no_update, no_update, no_update, no_update

#     data = all_data[idx]

#     # Clean arrays and use positive depth with reversed axis
#     pressure_dbar, temp_c, sal_psu = _clean_profile(data)
#     depth_m = pressure_dbar  # ~1 dbar ≈ 1 m (approx)

#     # Map
#     map_fig = px.scatter_geo(
#         lat=[data.get('latitude')],
#         lon=[data.get('longitude')],
#         title=None,
#         projection="natural earth"
#     )
#     map_fig.update_traces(marker=dict(size=10, color='#22d3ee', line=dict(width=1, color='#0ea5b7')))
#     map_fig.update_geos(
#         showland=True, landcolor="#0f172a",
#         showcountries=True, countrycolor="rgba(255,255,255,0.15)",
#         showocean=True, oceancolor="#0b1020",
#         lakecolor="#0b1020", coastlinecolor="rgba(255,255,255,0.15)"
#     )
#     map_fig = _style_fig(map_fig, "Location")

#     # Temperature profile
#     temp_fig = go.Figure()
#     temp_fig.add_trace(go.Scatter(
#         x=temp_c,
#         y=depth_m,
#         mode='lines+markers',
#         name='Temperature',
#         line=dict(color='#fb7185', width=2),
#         marker=dict(size=5, color='#fda4af')
#     ))
#     temp_fig.update_layout(xaxis_title="Temperature (°C)", yaxis_title="Depth (m)")
#     temp_fig.update_yaxes(autorange='reversed')  # REVERSE DEPTH
#     temp_fig = _style_fig(temp_fig, "Temperature Profile")

#     # Salinity profile
#     sal_fig = go.Figure()
#     sal_fig.add_trace(go.Scatter(
#         x=sal_psu,
#         y=depth_m,
#         mode='lines+markers',
#         name='Salinity',
#         line=dict(color='#60a5fa', width=2),
#         marker=dict(size=5, color='#93c5fd')
#     ))
#     sal_fig.update_layout(xaxis_title="Salinity (PSU)", yaxis_title="Depth (m)")
#     sal_fig.update_yaxes(autorange='reversed')  # REVERSE DEPTH
#     sal_fig = _style_fig(sal_fig, "Salinity Profile")

#     # T–S scatter (color by depth)
#     ts_fig = px.scatter(
#         x=sal_psu,
#         y=temp_c,
#         color=depth_m,
#         color_continuous_scale=['#22d3ee', '#60a5fa', '#a78bfa', '#fb7185'],
#         labels={'x': 'Salinity (PSU)', 'y': 'Temperature (°C)', 'color': 'Depth (m)'},
#         title=None
#     )
#     ts_fig = _style_fig(ts_fig, "T–S Diagram")

#     return map_fig, temp_fig, sal_fig, ts_fig

# if __name__ == '__main__':
#     app.run(debug=True, use_reloader=False, port=8050)








from typing import List
from dash import dcc, html, Input, Output, no_update
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

def make_labels(all_data: List[dict]) -> List[str]:
    return [f"{i}|{str(d.get('file', f'Profile {i}'))}" for i, d in enumerate(all_data)]

def parse_index(label: str) -> int:
    try:
        return int(str(label).split("|", 1)[0])
    except Exception:
        return -1

def _clean_profile(data: dict):
    p = np.asarray(data.get('pressure', []), dtype=float).flatten()
    t = np.asarray(data.get('temperature', []), dtype=float).flatten()
    s = np.asarray(data.get('salinity', []), dtype=float).flatten()
    m = np.isfinite(p) & np.isfinite(t) & np.isfinite(s)
    p, t, s = p[m], t[m], s[m]
    p = np.clip(p, 0, 6000)
    return p, t, s

def _style_fig(fig, title):
    fig.update_layout(
        title=title,
        template='plotly_dark',
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#e5e7eb'),
        margin=dict(l=8, r=8, t=40, b=8),
        title_font=dict(size=16, color='#e5e7eb', family='Segoe UI, Roboto, Arial'),
        autosize=True
    )
    return fig

def get_layout(all_data: List[dict]):
    labels = make_labels(all_data)
    return html.Div(className="page", children=[
        html.Div(className="controls card", children=[
            html.H3("Controls"),
            html.Label("Select Profile:", style={'fontWeight': '700'}),
            dcc.Dropdown(
                id='profile-dropdown',
                className='pretty-dropdown',
                options=labels,  # list[str]
                value=labels[0] if labels else None,
                clearable=False,
                placeholder="Select a profile...",
                persistence=True,
                persistence_type='memory',
                style={'marginTop': '8px'}
            )
        ]),
        html.Div(className="grid", children=[
            html.Div(className="card figure-card", children=[
                html.H3("Location"),
                dcc.Graph(id='map-plot', config={'displayModeBar': False, 'responsive': True},
                          style={'height': '40vh', 'minHeight': '320px', 'width': '100%'})
            ]),
            html.Div(className="card figure-card", children=[
                html.H3("Temperature Profile"),
                dcc.Graph(id='temp-profile', config={'displayModeBar': False, 'responsive': True},
                          style={'height': '40vh', 'minHeight': '320px', 'width': '100%'})
            ]),
            html.Div(className="card figure-card", children=[
                html.H3("Salinity Profile"),
                dcc.Graph(id='salinity-profile', config={'displayModeBar': False, 'responsive': True},
                          style={'height': '40vh', 'minHeight': '320px', 'width': '100%'})
            ]),
            html.Div(className="card figure-card", children=[
                html.H3("T–S Diagram"),
                dcc.Graph(id='temp-salinity-scatter', config={'displayModeBar': False, 'responsive': True},
                          style={'height': '40vh', 'minHeight': '320px', 'width': '100%'})
            ]),
        ])
    ])

def register_callbacks(app, all_data: List[dict]):
    @app.callback(
        [Output('map-plot', 'figure'),
         Output('temp-profile', 'figure'),
         Output('salinity-profile', 'figure'),
         Output('temp-salinity-scatter', 'figure')],
        [Input('profile-dropdown', 'value')]
    )
    def update_plots(selected_label: str):
        if not selected_label or not all_data:
            empty = _style_fig(go.Figure(), "")
            return empty, empty, empty, empty

        idx = parse_index(selected_label)
        if idx < 0 or idx >= len(all_data):
            return no_update, no_update, no_update, no_update

        data = all_data[idx]
        p, t, s = _clean_profile(data)
        depth = p

        map_fig = px.scatter_geo(lat=[data.get('latitude')], lon=[data.get('longitude')],
                                 title=None, projection="natural earth")
        map_fig.update_traces(marker=dict(size=10, color='#22d3ee', line=dict(width=1, color='#0ea5b7')))
        map_fig.update_geos(showland=True, landcolor="#0f172a", showcountries=True,
                            countrycolor="rgba(255,255,255,0.15)", showocean=True, oceancolor="#0b1020",
                            lakecolor="#0b1020", coastlinecolor="rgba(255,255,255,0.15)")
        map_fig = _style_fig(map_fig, "Location")

        temp_fig = go.Figure()
        temp_fig.add_trace(go.Scatter(x=t, y=depth, mode='lines+markers',
                                      name='Temperature', line=dict(color='#fb7185', width=2),
                                      marker=dict(size=5, color='#fda4af')))
        temp_fig.update_layout(xaxis_title="Temperature (°C)", yaxis_title="Depth (m)")
        temp_fig.update_yaxes(autorange='reversed')
        temp_fig = _style_fig(temp_fig, "Temperature Profile")

        sal_fig = go.Figure()
        sal_fig.add_trace(go.Scatter(x=s, y=depth, mode='lines+markers',
                                     name='Salinity', line=dict(color='#60a5fa', width=2),
                                     marker=dict(size=5, color='#93c5fd')))
        sal_fig.update_layout(xaxis_title="Salinity (PSU)", yaxis_title="Depth (m)")
        sal_fig.update_yaxes(autorange='reversed')
        sal_fig = _style_fig(sal_fig, "Salinity Profile")

        ts_fig = px.scatter(x=s, y=t, color=depth,
                            color_continuous_scale=['#22d3ee', '#60a5fa', '#a78bfa', '#fb7185'],
                            labels={'x': 'Salinity (PSU)', 'y': 'Temperature (°C)', 'color': 'Depth (m)'},
                            title=None)
        ts_fig = _style_fig(ts_fig, "T–S Diagram")
        return map_fig, temp_fig, sal_fig, ts_fig