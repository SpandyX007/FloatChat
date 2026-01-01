# from typing import Dict, Any
# from google import genai
# from google.genai import types
# from dotenv import load_dotenv
# import os

# # Load env vars
# load_dotenv()

# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# def process_query(query: str) -> Dict[str, Any]:
#     config = types.GenerateContentConfig(
#         system_instruction=(
#             "Extract the following from the query:\n"
#             "- time_duration as an object with ISO8601 dates: {start_time:'YYYY-MM-DD', end_time:'YYYY-MM-DD'}\n"
#             "Always normalize natural language time spans (e.g., 'last year', 'past 6 months') "
#             "into explicit start and end dates. Use today's date context when relative ranges are given. "
#             "Return ONLY a JSON object that matches the schema.\n"
#             "- parameters (array of strings)\n"
#             "- depth (string)\n"
#             "- bbox (array of 4 floating-point numbers: [min_lon, max_lon, min_lat, max_lat]), e.g., [-12.345,-67.890,23.456,78.901]:\n\n"
#             "Return ONLY a JSON object that matches the schema. "
#             "Do not include markdown or explanations.\n"
#             "- granularity: the number of samples per month, if asked\n"
#             " If a field is not specified in the query, return null for that field"
#         ),
#         response_mime_type="application/json",
#         response_schema=types.Schema(
#             type=types.Type.OBJECT,
#             properties={
#                 "time_duration": types.Schema(
#                     type=types.Type.OBJECT,
#                     properties={
#                         "start_time": types.Schema(type=types.Type.STRING, format="date"),
#                         "end_time": types.Schema(type=types.Type.STRING, format="date"),
#                     },
#                     required=["start_time", "end_time"]
#                 ),
#                 "parameters": types.Schema(
#                     type=types.Type.ARRAY,
#                     items=types.Schema(type=types.Type.STRING),
#                 ),
#                 "depth": types.Schema(type=types.Type.STRING),
#                 "bbox": types.Schema(
#                     type=types.Type.ARRAY,
#                     items=types.Schema(type=types.Type.NUMBER),
#                 ),
#             },
#             required=["time_duration", "parameters", "depth", "bbox"],
#         ),
#     )

#     resp = client.models.generate_content(
#         model="gemini-2.5-flash",
#         config=config,
#         contents=query,
#     )

#     if getattr(resp, "parsed", None) is not None:
#         return dict(resp.parsed)
#     return {}


from typing import Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
# import pandas as pd

# df=pd.read_csv("row4filtered_data.csv")

# Load env vars
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
# api_key = "apna_api"
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not set in environment")
genai.configure(api_key=api_key)


def process_query(query: str) -> Dict[str, Any]:
    """
    Sends a natural language query to Gemini and returns structured JSON.
    """
    system_instruction = (
        "Extract the following from the query and map parameters to the dataframe columns as required:\n"
        "- time_duration as an object with ISO8601 dates: {start_time:'YYYY-MM-DD', end_time:'YYYY-MM-DD'}\n"
        "Always normalize natural language time spans (e.g., 'last year', 'past 6 months') "
        "into explicit start and end dates. Use today's date context when relative ranges are given. "
        "Return ONLY a JSON object that matches the schema.\n"
        "- parameters (array of strings) mapped to the dataframe columns that are:['TEMP_surface_0_100', 'PSAL_surface_0_100','RHO_surface_0_100', 'N2_surface_0_100', 'SOUND_surface_0_100','TEMP_thermocline_100_500', 'PSAL_thermocline_100_500','RHO_thermocline_100_500', 'N2_thermocline_100_500','SOUND_thermocline_100_500', 'TEMP_upper_mesopelagic_500_1000','PSAL_upper_mesopelagic_500_1000', 'RHO_upper_mesopelagic_500_1000','N2_upper_mesopelagic_500_1000', 'SOUND_upper_mesopelagic_500_1000','TEMP_lower_mesopelagic_1000_2000', 'PSAL_lower_mesopelagic_1000_2000','RHO_lower_mesopelagic_1000_2000', 'N2_lower_mesopelagic_1000_2000','SOUND_lower_mesopelagic_1000_2000']\n"
        "- depth (string)\n"
        "- bbox (array of 4 floating-point numbers: [min_lon, min_lat, max_lon, max_lat]), e.g., [-12.345,-67.890,23.456,78.901], for the region mentioned, e.g. arabian sea, bay of bengal, etc.\n"
        "- granularity: the number of samples per month, if asked\n"
        "If a field is not specified in the query, return null for that field.\n"
        "Return ONLY a JSON object. Do not include markdown or explanations."
    )

    # Combine system instruction + user query
    prompt = f"{system_instruction}\n\nQuery: {query}"

    # Call Gemini
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
    response = model.generate_content(prompt)

    # Attempt to parse JSON from response
    raw_text = response.text.strip() if hasattr(response, "text") else ""
    try:
        # Extract JSON object if there is extra text
        import re
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            structured_json = json.loads(match.group(0))
            return structured_json
        else:
            # fallback: try to parse entire text
            return json.loads(raw_text)
    except Exception as e:
        print(f"Failed to parse Gemini output as JSON: {e}\nRaw text: {raw_text}")
        return {}
    
def process_response(response: Any, str_query: Dict) -> Dict[str, Any]:
    """
    Processes the client response to extract structured JSON and summary.
    """
    system_instruction=(
        "You are an expert data analyst. Given a DataFrame, and the original user query,"
        "summarize the key insights in a paragraph, and use bullets if necessary. "
        "Focus on the parameters mentioned in the response."
        "Return only the summary text, no markdown or backticks."
        "If the DataFrame is empty, say no relevant data found."
        "Do not mention the dataframe in any respect, instead refer to the query while addressing the user."
    )

    prompt = f"{system_instruction}\n\nDataFrame: {response}\n\nUser Query: {str_query}"
    
    # model = genai.GenerativeModel("gemini-2.5-pro")
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
    response = model.generate_content(prompt)
    
    return response.text.strip() if hasattr(response, "text") else ""


# process_response(df)

# QUEST="Show me the temperature and salinity trends in the Arabian Sea over the last 6 months at surface and thermocline depths."
# print(process_query(QUEST))
