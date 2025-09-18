import dash
from dash import dcc, html, Input, Output
from get_argo import load_argo_data
import index1 as plots  # plots page module

def build_navbar():
    return html.Nav(className="navbar card", children=[
        html.Div(className="nav-left"),
        html.Div(className="nav-right", children=[
            dcc.Link("Home", href="/", id="nav-home", className="nav-link"),
            dcc.Link("Plots", href="/plots", id="nav-plots", className="nav-link"), 
            dcc.Link("Chat", href="/chat", id="nav-chat", className="nav-link"),
        ])
    ])

def home_layout():
    return html.Div(className="page", children=[
        html.Div(className="hero card", children=[
            html.H2("Explore Global Oceans with Argo Profiles", className="hero-title"),
            html.P("Visualize temperature, salinity and depth profiles. Chat assistant coming soon.", className="hero-subtitle"),
            html.Div(className="hero-actions", children=[
                dcc.Link("View Plots", href="/plots", className="btn btn-primary"),
                dcc.Link("Open Chat", href="/chat", className="btn btn-secondary"),
            ])
        ]),
        html.Div(className="info-grid", children=[
            html.Div(className="card info-card", children=[
                html.H3("What is Argo?"),
                html.P("Argo floats are autonomous instruments measuring ocean temperature and salinity profiles.")
            ]),
            html.Div(className="card info-card", children=[
                html.H3("Data Source"),
                html.P("Data fetched from IFREMER Argo FTP with robust parsing and validation.")
            ]),
            html.Div(className="card info-card", children=[
                html.H3("Get Started"),
                html.P("Use the Plots page to select a profile and explore T–S diagrams and depth profiles.")
            ]),
        ])
    ])

# Load data once
all_data = load_argo_data()

app = dash.Dash(__name__, suppress_callback_exceptions=True)

# Register plot callbacks with this app
plots.register_callbacks(app, all_data)

# Base layout + router
app.layout = html.Div(className="app", children=[
    html.Div(className="header", children=[
        html.H1("Argo Float Profile Viewer", className="title"),
        html.P("Explore temperature, salinity, and depth profiles from Argo floats.", className="subtitle")
    ]),
    build_navbar(),
    dcc.Location(id="url", refresh=False),
    html.Div(id="page-content")
])

# Router
@app.callback(Output("page-content", "children"), Input("url", "pathname"))
def render_page(pathname: str):
    if pathname == "/plots":
        return plots.get_layout(all_data)
    if pathname == "/chat":
        return html.Div(className="page", children=[
            html.Div(className="card", children=[
                html.H3("Chat Assistant"),
                html.P("Chat feature coming soon.")
            ])
        ])
    return home_layout()

# NEW: highlight active nav link (replaces unsupported active_className)
@app.callback(
    [Output("nav-home", "className"),
     Output("nav-plots", "className"),
     Output("nav-chat", "className")],
    [Input("url", "pathname")]
)
def highlight_nav(pathname: str):
    base = "nav-link"
    def cls(route: str) -> str:
        return f"{base} active" if pathname == route else base
    return cls("/"), cls("/plots"), cls("/chat")

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=8050)