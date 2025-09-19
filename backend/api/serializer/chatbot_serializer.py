from pydantic import BaseModel
from datetime import datetime

def query_serializer(time_duration:datetime, region:str, parameters:str):
    return ({
        "time_duration":time_duration,
        "region":region,
        "parameters":parameters,
    })