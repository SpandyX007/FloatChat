from typing import Any, Dict, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
import json

load_dotenv()
client = genai.Client()

def _coerce_output(payload: Dict[str, Any]) -> Dict[str, Any]:
    # Ensure keys exist
    out: Dict[str, Any] = {
        "time_duration": payload.get("time_duration", ""),
        "region": payload.get("region", ""),
        "parameters": payload.get("parameters", []),
        "depth": payload.get("depth", ""),
    }
    # Coerce parameters -> list[str]
    params = out["parameters"]
    if isinstance(params, str):
        # split on commas if a string was returned
        out["parameters"] = [p.strip() for p in params.split(",") if p.strip()]
    elif isinstance(params, list):
        out["parameters"] = [str(p) for p in params]
    else:
        out["parameters"] = []
    # Coerce depth -> str
    if not isinstance(out["depth"], str):
        out["depth"] = json.dumps(out["depth"])
    return out

def gemini_response(query: str) -> Dict[str, Any]:
    config = types.GenerateContentConfig(
        system_instruction=(
            "Return ONLY a JSON object with keys: time_duration, region, parameters, depth. "
            "No explanations, no markdown."
        ),
        response_mime_type="application/json",
        response_schema=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "time_duration": types.Schema(type=types.Type.STRING),
                "region": types.Schema(type=types.Type.STRING),
                "parameters": types.Schema(  # expect array of strings
                    type=types.Type.ARRAY,
                    items=types.Schema(type=types.Type.STRING),
                ),
                "depth": types.Schema(type=types.Type.STRING),  # depth as a string (e.g., '0-2000m')
            },
            required=["time_duration", "region", "parameters", "depth"],
        ),
    )

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        config=config,
        contents=query
    )

    # Prefer structured output when available
    if getattr(resp, "parsed", None) is not None:
        try:
            return _coerce_output(dict(resp.parsed))  # ensure dict-like
        except Exception:
            pass

    # Fallback to parsing text as JSON
    try:
        raw = json.loads(resp.text)
        if isinstance(raw, dict):
            return _coerce_output(raw)
        return _coerce_output({})
    except Exception:
        # Last resort: empty structure with raw text for debugging (optional)
        return {
            "time_duration": "",
            "region": "",
            "parameters": [],
            "depth": "",
        }