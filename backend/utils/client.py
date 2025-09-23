from typing import Dict, Any
# from flask import json
import pandas as pd
import numpy as np
from .llm_handler import process_query, process_response
from .server import run_argo_pipeline

# dataset=pd.read_csv("dataframe.csv")

# =========================
# Server function
# =========================
# def get_argo_data(structured_query: dict) -> pd.DataFrame:
#     """
#     Returns superset DataFrame.
#     """
#     df= run_argo_pipeline(
#         csv_path="grid_sampled_profiles.csv",
#         bbox=[50.0, 5.0, 75.0, 25.0],
#         start_date="2020-01-01",
#         end_date="2021-01-01",
#         samples_per_month=2,
#         random_state=42,
#         step_size=1
#     )
    
#     return df

# =========================
# Client processor
# ========================= 
from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd


def extract_and_run_pipeline(
    json_input: Dict[str, Any],
    csv_path: str = r"D:\BMSIT College Docs\SEM5\MiniProject\React_frontend\ocean-scribe-charts-main\backend\utils\grid_sampled_profiles.csv"
) -> Optional[pd.DataFrame]:
    """
    Extract parameters from input JSON and call run_argo_pipeline.

    Parameters
    ----------
    json_input : dict
        Example:
        {
            'time_duration': {'start_time': '2023-07-24', 'end_time': '2024-07-24'},
            'parameters': [...],
            'depth': None,
            'bbox': [79.5, 5.0, 100.0, 22.0],
            'granularity': None
        }
    csv_path : str
        Path to CSV of sampled profiles

    Returns
    -------
    pd.DataFrame or None
        Result of the pipeline if successful, else None
    """
    try:
        # --- Extract and validate dates ---
        time_duration = json_input.get("time_duration", {})
        start_date_str = time_duration.get("start_time")
        end_date_str = time_duration.get("end_time")

        def validate_date(date_str: str) -> str:
            """Validate and ensure date is in YYYY-MM-DD format."""
            if not date_str:
                raise ValueError("Date string is missing.")
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
                return parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                raise ValueError(f"Invalid date format for '{date_str}', expected YYYY-MM-DD.")

        start_date = validate_date(start_date_str)
        end_date = validate_date(end_date_str)

        # --- Extract bbox ---
        bbox = json_input.get("bbox")
        if not bbox or len(bbox) != 4:
            raise ValueError("Bounding box (bbox) must be a list of 4 numeric values.")

        # --- Handle granularity/sampling ---
        step_size = 1  # default
        samples_per_month = json_input.get("granularity", 2) or 2

        # --- Call the pipeline ---
        df_result = run_argo_pipeline(
            csv_path=csv_path,
            bbox=bbox,
            start_date=start_date,
            end_date=end_date,
            samples_per_month=samples_per_month,
            random_state=42,
            step_size=step_size,
            
        )

        return df_result

    except Exception as e:
        print(f"Error in extract_and_run_pipeline: {e}")
        return None

# def filter_dataframe_by_parameters(df, parameters_json):
#     """
#     Filters a DataFrame to include only the columns specified in the 'parameters'
#     key of a JSON object, plus the 'profile_date' column.

#     Args:
#         df (pd.DataFrame): The input DataFrame.
#         parameters_json (dict): A JSON object (as a Python dictionary)
#                                 containing the 'parameters' key.

#     Returns:
#         pd.DataFrame: A new DataFrame with the filtered columns.
#     """
#     # We are including 'profile_date' as it appears to be the index column
#     columns_to_keep = ['profile_date'] + parameters_json['parameters']
    
#     # Return a new dataframe with only the selected columns
#     df_filtered = df[columns_to_keep]

#     statistics = {
#         'mean': df_filtered.mean(numeric_only=True).to_dict(),
#         'median': df_filtered.median(numeric_only=True).to_dict(),
#         'min': df_filtered.min(numeric_only=True).to_dict(),
#         'max': df_filtered.max(numeric_only=True).to_dict(),
#         'var': df_filtered.var(numeric_only=True).to_dict(),
#         'std': df_filtered.std(numeric_only=True).to_dict(),
#     }
#     return statistics, df_filtered



# =========================
# Host endpoint
# =========================
def host_process(user_question: str) -> dict:
    """
    Full MCP host: calls LLM, then client
    """
    # Step 1: LLM handler returns structured JSON
    structured_query = process_query(user_question)
    print(structured_query)
    
    
    argo_df= extract_and_run_pipeline(structured_query)
    argo_df.to_csv("spandanbkl.csv",index=False)
    response= process_response(argo_df)
    return response,argo_df
    # print(argo_df)

# host_process("give me the salinity, depth of bay of bengal of last year")




    # stats, filtered_df = filter_dataframe_by_parameters(argo_df, structured_query)
    # return stats, filtered_df
    # filtered_stats, filtered_df = extract_params(structured_query, argo_df)
    # return filtered_stats, filtered_df

# # Example usage
# question="Gimme the temperature profile of arabian sea for the last year"
# filtered_df = host_process(question)
# print(filtered_df.head())
# # print(answer)

# # print(structured_query)