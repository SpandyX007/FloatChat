# FloatChat

**FloatChat** is a toolkit for exploring and discussing **ocean float (Argo) data** in an interactive chat-like interface. It bridges **NetCDF float profiles** with a conversational interface, making it easier for researchers, students, and enthusiasts to query, visualize, and analyze float data.

---

## 🚀 Features
- **Argo Float Data Access** – Fetch and parse float `.nc` and `.meta` files directly from Ifremer or USGODAE servers.  
- **Metadata Explorer** – Inspect float configuration, sensors, deployment details.  
- **Profile Viewer** – Extract BGC (Biogeochemical) and CTD profiles into pandas DataFrames.  
- **Chat Interface** – Ask natural-language questions about float data and get structured responses.  
- **Extensible** – Easily plug into Jupyter, Streamlit, or API services.  

---

## 📦 Installation
```bash
# Clone repo
git clone https://github.com/yourusername/floatchat.git

# Download grid sampled data from the link below
https://drive.google.com/file/d/1kdXAZRrO76pk9oqNpqKeUW9nN8MTm7Yq/view?usp=sharing
# Paste it in backend_react/utils folder

# Create Python Virtual Environment
python -m venv .venv
(activate it)

# Install dependencies
pip install -r requirements.txt

# Change Dir to Frontend and execute the following:
cd frontend_react
npm i
npm run dev

# For Streamlit UI. run the following commands
cd frontend
streamlit run streamlit_app_Version3

# Change Dir to Backend and Execute the Following (venv activated):
cd backend
uvicorn main:app --reload
```

## Workflow and Components (Ordered by Flow)

### 1. Host/Client Interface (`client.py`)

This module is the first step in the workflow. The **user/client** sends a **natural language query**, which is converted into a **structured JSON query** using the **LLM handler** (`process_query`). It serves as the central interface between user input and the ARGO data pipeline.

### 2. ARGO Data Processing Pipeline (`server.py`)

The pipeline receives the structured JSON query from the client. It performs the following:

* Filters CSV metadata by **bounding box and time**.
* Downloads relevant **NetCDF profiles**.
* Extracts key variables (**TEMP, PSAL, PRES**) and cleans the data.
* Computes **monthly depth-region time series** with derived metrics (**density, buoyancy frequency (N²), sound speed**).
  The processed DataFrame is returned to the **Host/Client Interface**.

### 3. MCP Server (`argo_mcp_server.py`)

This asynchronous server provides additional **measurement queries** from a PostgreSQL database. Clients can request **depth, region, and time-specific measurements**. The server returns JSON results, which can also be processed by the **client interface**.

### 4. Host/Client Interface (Filtered & Formatted)

Upon receiving the processed DataFrame from the pipeline (or optional MCP Server), the client interface:

* Filters the DataFrame to include only **requested parameters**.
* Formats the data into **user-friendly records**.
* Prepares it for API consumption.

### 5. FastAPI Router (`parametersapi.py`)

The router exposes endpoints for serving processed data:

* **POST `/user-query`**: Accepts natural language queries, runs `host_process`, and returns both **LLM response** and **chart-ready DataFrame**.
* **GET `/read-params`**: Serves the **last dataset** with selected metrics and optional row limits.
* **GET `/get-maps`**: Returns **profile name to coordinates mapping** from CSV.
  It ensures a normalized **profile_date column** and renames surface parameter columns for consistency.

### 6. FastAPI Application (`app.py`)

The main API server mounts the router, enables **CORS**, and exposes a root endpoint (`GET /`). It serves all endpoints, allowing clients to access **processed ARGO metrics, charts, and map data**.

---

## Summary

* **`client.py`** → Convert NL query → structured JSON → pipeline.
* **`server.py`** → Filter CSV → download NetCDF → compute depth-region metrics.
* **`argo_mcp_server.py`** → Optional measurements query via PostgreSQL.
* **`parametersapi.py`** → Serve queries, results, map data via API.
* **`app.py`** → Start FastAPI server and expose endpoints.

This architecture allows **end-to-end querying and processing** of ARGO float data via **natural language** or **API calls**, producing **ready-to-use oceanographic metrics**.
