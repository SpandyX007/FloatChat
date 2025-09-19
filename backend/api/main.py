from fastapi import FastAPI
from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.chat import chat_router

app=FastAPI()

origins=["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # List of allowed origins
    allow_credentials=True, # Allow credentials such as cookies and authorization headers
    allow_methods=["*"], # Allow all HTTP methods
    allow_headers=["*"], # Allow all HTTP headers
)

app.include_router(chat_router)