import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import folium
from streamlit_folium import st_folium
import json
from datetime import datetime, timedelta
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Page configuration
st.set_page_config(
    page_title="FloatChat - Ocean Data Visualization",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS
st.markdown("""
<style>
    .main > div {
        padding-top: 2rem;
    }
    .stAlert {
        margin-top: 1rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .chat-message {
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
        border-left: 4px solid #1f77b4;
        background-color: #f8f9fa;
    }
    .nav-button {
        margin: 0.25rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: none;
        background-color: #1f77b4;
        color: white;
        cursor: pointer;
    }
    .nav-button:hover {
        background-color: #1565c0;
    }
    .chat-container {
        max-height: 500px;
        overflow-y: auto;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        background-color: #fafafa;
    }
</style>
""", unsafe_allow_html=True)

# Backend URL
BACKEND_URL = "http://localhost:8000"

# Initialize session state
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'current_data' not in st.session_state:
    st.session_state.current_data = None
if 'map_data' not in st.session_state:
    st.session_state.map_data = None
if 'current_page' not in st.session_state:
    st.session_state.current_page = 'Home'

def make_api_request(endpoint, method="GET", data=None):
    """Make API request to backend"""
    try:
        url = f"{BACKEND_URL}{endpoint}"
        if method == "POST":
            response = requests.post(url, json=data)
        else:
            response = requests.get(url)
        
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"API Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        st.error("Connection error. Please make sure the backend server is running.")
        return None
    except Exception as e:
        st.error(f"Error: {str(e)}")
        return None

def process_query(query):
    """Process user query through backend"""
    with st.spinner("Processing your query..."):
        result = make_api_request("/parameters/user-query", "POST", {"query": query})
        
        if result:
            st.session_state.chat_history.append({"query": query, "response": result})
            st.session_state.current_data = result.get("chart_data", [])
            return result
    return None

def get_map_coordinates():
    """Fetch map coordinates from backend"""
    result = make_api_request("/parameters/get-maps")
    if result:
        st.session_state.map_data = result
    return result

def create_time_series_dropdown_plot(data, selected_parameter):
    """Create time series plot for selected parameter with date on x-axis"""
    if not data or not selected_parameter:
        return None
    
    df = pd.DataFrame(data)
    if df.empty or selected_parameter not in df.columns:
        return None
    
    # Convert month to datetime for proper x-axis
    if 'month' in df.columns:
        df['date'] = pd.to_datetime(df['month'])
    elif 'profile_date' in df.columns:
        df['date'] = pd.to_datetime(df['profile_date'])
    else:
        # Create a sequential date if no date column exists
        df['date'] = pd.date_range(start='2020-01-01', periods=len(df), freq='M')
    
    # Remove invalid data points
    df_clean = df.dropna(subset=[selected_parameter, 'date'])
    
    if df_clean.empty:
        return None
    
    # Create the time series plot
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=df_clean['date'],
        y=df_clean[selected_parameter],
        mode='lines+markers',
        name=selected_parameter,
        line=dict(color='#1f77b4', width=2),
        marker=dict(size=6, color='#1f77b4'),
        hovertemplate=f'<b>{selected_parameter}</b><br>Date: %{{x}}<br>Value: %{{y:.3f}}<extra></extra>'
    ))
    
    fig.update_layout(
        title=f'{selected_parameter} Over Time',
        xaxis_title='Date',
        yaxis_title=f'{selected_parameter}',
        height=400,
        hovermode='x unified',
        showlegend=False
    )
    
    return fig

def create_correlation_heatmap(data):
    """Create correlation heatmap for ocean parameters"""
    if not data:
        return None
    
    df = pd.DataFrame(data)
    if df.empty:
        return None
    
    # Select only numeric columns (excluding date columns)
    numeric_cols = []
    for col in df.columns:
        if col not in ['month', 'profile_date', 'date'] and pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols.append(col)
    
    if len(numeric_cols) < 2:
        return None
    
    # Calculate correlation matrix
    corr_matrix = df[numeric_cols].corr()
    
    # Create heatmap
    fig = go.Figure(data=go.Heatmap(
        z=corr_matrix.values,
        x=corr_matrix.columns,
        y=corr_matrix.columns,
        colorscale='RdBu',
        zmid=0,
        text=corr_matrix.round(3).values,
        texttemplate="%{text}",
        textfont={"size": 12},
        hoverongaps=False,
        colorbar=dict(title="Correlation")
    ))
    
    fig.update_layout(
        title="Parameter Correlation Matrix",
        height=500,
        xaxis_title="Parameters",
        yaxis_title="Parameters"
    )
    
    return fig

def create_distribution_plots(data):
    """Create parameter distribution plots"""
    if not data:
        return None
    
    df = pd.DataFrame(data)
    if df.empty:
        return None
    
    # Get numeric parameters
    numeric_cols = []
    for col in df.columns:
        if col not in ['month', 'profile_date', 'date'] and pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols.append(col)
    
    if not numeric_cols:
        return None
    
    # Calculate number of rows and columns for subplots
    n_params = len(numeric_cols)
    n_cols = min(3, n_params)  # Max 3 columns
    n_rows = (n_params + n_cols - 1) // n_cols
    
    # Create subplots
    fig = make_subplots(
        rows=n_rows, 
        cols=n_cols,
        subplot_titles=numeric_cols,
        vertical_spacing=0.1,
        horizontal_spacing=0.1
    )
    
    colors = px.colors.qualitative.Set1
    
    for i, param in enumerate(numeric_cols):
        row = i // n_cols + 1
        col = i % n_cols + 1
        
        # Remove NaN values for histogram
        param_data = df[param].dropna()
        
        if len(param_data) > 0:
            fig.add_trace(
                go.Histogram(
                    x=param_data,
                    name=param,
                    nbinsx=20,
                    marker_color=colors[i % len(colors)],
                    opacity=0.7,
                    showlegend=False
                ),
                row=row, col=col
            )
    
    fig.update_layout(
        title="Parameter Distributions",
        height=300 * n_rows,
        showlegend=False
    )
    
    return fig

def create_map_visualization():
    """Create Folium map with profile locations"""
    if not st.session_state.map_data:
        get_map_coordinates()
    
    if not st.session_state.map_data:
        return None
    
    # Create base map centered on Indian Ocean
    m = folium.Map(
        location=[10, 85],
        zoom_start=5,
        tiles='OpenStreetMap'
    )
    
    # Add profile locations
    for profile_name, coords in st.session_state.map_data.items():
        folium.Marker(
            location=[coords['latitude'], coords['longitude']],
            popup=f"Profile: {profile_name}<br>Lat: {coords['latitude']:.3f}<br>Lon: {coords['longitude']:.3f}",
            tooltip=profile_name,
            icon=folium.Icon(color='blue', icon='tint')
        ).add_to(m)
    
    return m

def create_parameter_summary(data):
    """Create parameter summary statistics"""
    if not data:
        return None
    
    df = pd.DataFrame(data)
    if df.empty:
        return None
    
    numeric_cols = []
    for col in df.columns:
        if col not in ['month', 'profile_date', 'date'] and pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols.append(col)
    
    summary_stats = []
    for col in numeric_cols:
        if col in df.columns:
            stats = {
                'Parameter': col,
                'Count': df[col].count(),
                'Mean': df[col].mean(),
                'Std': df[col].std(),
                'Min': df[col].min(),
                'Max': df[col].max(),
                'Median': df[col].median()
            }
            summary_stats.append(stats)
    
    return pd.DataFrame(summary_stats)

# Navigation
def render_navigation():
    """Render navigation bar"""
    st.markdown("### 🌊 FloatChat - Ocean Data Visualization Platform")
    
    col1, col2, col3, col4, col5 = st.columns([1, 1, 1, 1, 2])
    
    with col1:
        if st.button("🏠 Home", key="nav_home"):
            st.session_state.current_page = 'Home'
            st.rerun()
    
    with col2:
        if st.button("🗺️ Map", key="nav_map"):
            st.session_state.current_page = 'Map'
            st.rerun()
    
    with col3:
        if st.button("📊 Graphs", key="nav_graphs"):
            st.session_state.current_page = 'Graphs'
            st.rerun()
    
    with col4:
        if st.button("ℹ️ About", key="nav_about"):
            st.session_state.current_page = 'About'
            st.rerun()
    
    st.divider()

# Page: Home (Chat Interface)
def render_home_page():
    """Render home page with chat interface"""
    st.header("💬 Chat with Ocean Data")
    
    # Main chat area and sidebar layout
    col_main, col_sidebar = st.columns([3, 1])
    
    with col_main:
        # Query input
        st.subheader("Ask about ocean data:")
        user_query = st.text_input(
            "Enter your query:",
            placeholder="e.g., Show me temperature data for Bay of Bengal last year",
            key="user_query_home"
        )
        
        col_submit, col_clear = st.columns([1, 1])
        with col_submit:
            if st.button("Submit Query", type="primary", key="submit_home"):
                if user_query:
                    result = process_query(user_query)
                    if result:
                        st.success("Query processed successfully!")
                        st.rerun()
        
        with col_clear:
            if st.button("Clear History", key="clear_home"):
                st.session_state.chat_history = []
                st.session_state.current_data = None
                st.rerun()
        
        # Quick query examples
        st.subheader("Quick Query Examples:")
        example_queries = [
            "Show temperature and salinity in Bay of Bengal for last year",
            "Give me ocean density data for Arabian Sea",
            "Temperature profile of Indian Ocean for past 6 months",
            "Show all parameters for Bay of Bengal in 2023"
        ]
        
        for i, query in enumerate(example_queries):
            if st.button(query, key=f"example_home_{i}"):
                result = process_query(query)
                if result:
                    st.success("Query processed successfully!")
                    st.rerun()
        
        # Current response
        if st.session_state.chat_history:
            latest_chat = st.session_state.chat_history[-1]
            st.subheader("Latest Response:")
            st.markdown(f"**Query:** {latest_chat['query']}")
            st.markdown(f"**Response:** {latest_chat['response'].get('response', 'No response')}")
    
    with col_sidebar:
        st.subheader("📊 Quick Stats")
        if st.session_state.current_data:
            df = pd.DataFrame(st.session_state.current_data)
            st.metric("Data Points", len(df))
            st.metric("Parameters", len([col for col in df.columns if col not in ['month', 'profile_date']]))
            st.metric("Time Range", f"{len(df)} months" if len(df) > 0 else "N/A")
        
        st.subheader("💭 Chat History")
        if st.session_state.chat_history:
            with st.container():
                st.markdown('<div class="chat-container">', unsafe_allow_html=True)
                for i, chat in enumerate(reversed(st.session_state.chat_history[-10:])):
                    with st.expander(f"Query {len(st.session_state.chat_history) - i}"):
                        st.markdown(f"**Q:** {chat['query'][:100]}{'...' if len(chat['query']) > 100 else ''}")
                        st.markdown(f"**A:** {chat['response'].get('response', 'No response')[:200]}{'...' if len(str(chat['response'].get('response', ''))) > 200 else ''}")
                st.markdown('</div>', unsafe_allow_html=True)
        else:
            st.info("No chat history yet. Start by asking a question!")

# Page: Map
def render_map_page():
    """Render map page"""
    st.header("🗺️ Ocean Profile Locations")
    
    if st.button("🔄 Refresh Map Data"):
        get_map_coordinates()
        st.rerun()
    
    map_viz = create_map_visualization()
    if map_viz:
        st_folium(map_viz, width=None, height=600)
        
        if st.session_state.map_data:
            st.subheader("📊 Profile Statistics")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Total Profiles", len(st.session_state.map_data))
            with col2:
                if st.session_state.map_data:
                    lats = [coords['latitude'] for coords in st.session_state.map_data.values()]
                    st.metric("Latitude Range", f"{min(lats):.2f}° to {max(lats):.2f}°")
            with col3:
                if st.session_state.map_data:
                    lons = [coords['longitude'] for coords in st.session_state.map_data.values()]
                    st.metric("Longitude Range", f"{min(lons):.2f}° to {max(lons):.2f}°")
    else:
        st.warning("No map data available. Please run a query first from the Home page.")

# Page: Graphs (Modified as requested)
def render_graphs_page():
    """Render improved graphs page with better layout"""
    st.header("📊 Data Visualizations")
    
    if not st.session_state.current_data:
        st.warning("No data available. Please run a query first from the Home page.")
        return
    
    df = pd.DataFrame(st.session_state.current_data)
    
    # Get available parameters (excluding date columns)
    parameters = []
    for col in df.columns:
        if col not in ['month', 'profile_date', 'date'] and pd.api.types.is_numeric_dtype(df[col]):
            parameters.append(col)
    
    if not parameters:
        st.error("No numeric parameters found in the data.")
        return
    
    # SECTION 1: Time Series Analysis with Dropdown
    st.subheader("📈 Time Series Analysis")
    
    # Parameter selection dropdown
    selected_parameter = st.selectbox(
        "Select parameter to visualize over time:",
        options=parameters,
        key="time_series_param"
    )
    
    # Create and display time series plot
    if selected_parameter:
        fig_ts = create_time_series_dropdown_plot(st.session_state.current_data, selected_parameter)
        if fig_ts:
            st.plotly_chart(fig_ts, use_container_width=True)
        else:
            st.warning(f"Could not create time series plot for {selected_parameter}")
    
    st.divider()
    
    # SECTION 2: Parameter Correlations Matrix
    st.subheader("🔗 Parameter Correlations Matrix")
    
    fig_corr = create_correlation_heatmap(st.session_state.current_data)
    if fig_corr:
        st.plotly_chart(fig_corr, use_container_width=True)
    else:
        st.warning("Could not create correlation matrix. Need at least 2 numeric parameters.")
    
    st.divider()
    
    # SECTION 3: Parameter Distributions
    st.subheader("📊 Parameter Distributions")
    
    fig_dist = create_distribution_plots(st.session_state.current_data)
    if fig_dist:
        st.plotly_chart(fig_dist, use_container_width=True)
    else:
        st.warning("Could not create distribution plots.")
    
    st.divider()
    
    # Additional sections in expandable containers
    with st.expander("📋 Summary Statistics"):
        summary_df = create_parameter_summary(st.session_state.current_data)
        if summary_df is not None:
            st.dataframe(summary_df, use_container_width=True)
    
    with st.expander("🔍 Raw Data"):
        st.dataframe(df, use_container_width=True)
        
        # Download button
        csv = df.to_csv(index=False)
        st.download_button(
            label="📥 Download CSV",
            data=csv,
            file_name=f"ocean_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )

# Page: About
def render_about_page():
    """Render about page"""
    st.header("ℹ️ About FloatChat")
    
    # Introduction
    st.markdown("""
    ## Welcome to FloatChat 🌊
    
    **FloatChat** is an interactive ocean data visualization platform that leverages ARGO float data to provide insights into ocean conditions worldwide.
    """)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🤖 What is FloatChat?")
        st.markdown("""
        FloatChat is a conversational AI-powered platform that allows users to:
        
        - **Query ocean data** using natural language
        - **Visualize oceanographic parameters** through interactive charts
        - **Explore geographic distributions** of ocean measurements
        - **Analyze temporal trends** in ocean conditions
        - **Download and export** data for further analysis
        
        Simply ask questions like *"Show me temperature data for Bay of Bengal last year"* and get instant visualizations!
        """)
        
        st.subheader("🎯 Features")
        st.markdown("""
        - **Natural Language Queries**: Ask questions in plain English
        - **Interactive Visualizations**: Time series, correlations, distributions
        - **Geographic Mapping**: See where data was collected
        - **Real-time Data Processing**: Get fresh insights instantly
        - **Data Export**: Download results as CSV files
        """)
    
    with col2:
        st.subheader("🌊 What are ARGO Floats?")
        st.markdown("""
        **ARGO** is a global ocean observing system that provides real-time data about the ocean's temperature, salinity, and other properties.
        
        **Key Facts:**
        - **4,000+ active floats** worldwide
        - **Autonomous instruments** that drift with ocean currents
        - **10-day measurement cycles** from surface to 2000m depth
        - **Free and open data** available to all researchers
        - **20+ years** of continuous ocean monitoring
        """)
        
        st.subheader("📊 Ocean Data Parameters")
        st.markdown("""
        Our platform analyzes key oceanographic parameters:
        
        - **Temperature (TEMP)**: Ocean temperature profiles
        - **Salinity (PSAL)**: Practical salinity measurements  
        - **Density (RHO)**: Water density calculations
        - **Buoyancy Frequency (N2)**: Ocean stratification
        - **Sound Speed (SOUND)**: Acoustic velocity in water
        
        Data is organized by depth regions:
        - **Surface (0-100m)**
        - **Thermocline (100-500m)**
        - **Upper Mesopelagic (500-1000m)**
        - **Lower Mesopelagic (1000-2000m)**
        """)
    
    st.divider()
    
    # Technical Information
    st.subheader("🔧 Technical Details")
    col_tech1, col_tech2 = st.columns(2)
    
    with col_tech1:
        st.markdown("""
        **Backend Technologies:**
        - FastAPI for RESTful API
        - Python data processing pipeline
        - Gemini AI for natural language processing
        - Pandas/NumPy for data manipulation
        - NetCDF4 for ARGO data formats
        """)
    
    with col_tech2:
        st.markdown("""
        **Frontend Technologies:**
        - Streamlit for web interface
        - Plotly for interactive visualizations
        - Folium for geographic mapping
        - Responsive multi-page design
        """)
    
    # Usage Instructions
    st.subheader("🚀 How to Use FloatChat")
    st.markdown("""
    1. **Start at Home**: Use the chat interface to ask questions about ocean data
    2. **View Maps**: Navigate to the Map page to see geographic distribution of measurements
    3. **Analyze Graphs**: Visit the Graphs page for detailed visualizations and statistics
    4. **Learn More**: Return to this About page for additional information
    
    **Example Queries:**
    - "Show me temperature trends in the Arabian Sea for 2023"
    - "What's the salinity data for Bay of Bengal last 6 months?"
    - "Give me all ocean parameters for Indian Ocean in 2022"
    """)
    
    st.divider()
    
    # Footer
    st.markdown("""
    <div style='text-align: center; color: #888; margin-top: 2rem;'>
        <p><strong>FloatChat v1.0</strong> - Ocean Data Visualization Platform</p>
        <p>Built with ❤️ for ocean science and data exploration</p>
        <p>Data provided by the <a href="https://argo.ucsd.edu/" target="_blank">International ARGO Program</a></p>
    </div>
    """, unsafe_allow_html=True)

# Main App Logic
def main():
    """Main application logic"""
    render_navigation()
    
    # Route to appropriate page
    if st.session_state.current_page == 'Home':
        render_home_page()
    elif st.session_state.current_page == 'Map':
        render_map_page()
    elif st.session_state.current_page == 'Graphs':
        render_graphs_page()
    elif st.session_state.current_page == 'About':
        render_about_page()

if __name__ == "__main__":
    main()