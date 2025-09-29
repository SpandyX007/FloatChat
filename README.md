# FloatChat

**FloatChat** is a toolkit for exploring and discussing **ocean float (Argo) data** in an interactive chat-like interface. It bridges **NetCDF float profiles** with a conversational interface, making it easier for researchers, students, and enthusiasts to query, visualize, and analyze float data.

---

## 🚀 Features
- 📡 **Argo Float Data Access** – Fetch and parse float `.nc` and `.meta` files directly from Ifremer or USGODAE servers.  
- 🔍 **Metadata Explorer** – Inspect float configuration, sensors, deployment details.  
- 📊 **Profile Viewer** – Extract BGC (Biogeochemical) and CTD profiles into pandas DataFrames.  
- 💬 **Chat Interface** – Ask natural-language questions about float data and get structured responses.  
- 🔗 **Extensible** – Easily plug into Jupyter, Streamlit, or API services.  

---

## 📦 Installation
```bash
# Clone repo
git clone https://github.com/yourusername/floatchat.git

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
