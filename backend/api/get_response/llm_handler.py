from typing import Dict, Any
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

# Load env vars
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def process_query(query: str) -> Dict[str, Any]:
    config = types.GenerateContentConfig(
        system_instruction=(
            "Extract the following from the query:\n"
            "- time_duration as an object with ISO8601 dates: {start_time:'YYYY-MM-DD', end_time:'YYYY-MM-DD'}\n"
            "Always normalize natural language time spans (e.g., 'last year', 'past 6 months') "
            "into explicit start and end dates. Use today's date context when relative ranges are given. "
            "Return ONLY a JSON object that matches the schema.\n"
            "- parameters (array of strings)\n"
            "- depth (string)\n"
            "- bbox (array of 4 floating-point numbers: [min_lon, max_lon, min_lat, max_lat]), e.g., [-12.345,-67.890,23.456,78.901]:\n\n"
            "Return ONLY a JSON object that matches the schema. "
            "Do not include markdown or explanations."
        ),
        response_mime_type="application/json",
        response_schema=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "time_duration": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "start_time": types.Schema(type=types.Type.STRING, format="date"),
                        "end_time": types.Schema(type=types.Type.STRING, format="date"),
                    },
                    required=["start_time", "end_time"]
                ),
                "parameters": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(type=types.Type.STRING),
                ),
                "depth": types.Schema(type=types.Type.STRING),
                "bbox": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(type=types.Type.NUMBER),
                ),
            },
            required=["time_duration", "parameters", "depth", "bbox"],
        ),
    )

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        config=config,
        contents=query,
    )

    if getattr(resp, "parsed", None) is not None:
        return dict(resp.parsed)
    return {}
