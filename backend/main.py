from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from parameters.parametersapi import read_parameters
from utils.client import host_process
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount router at /parameters/...
app.include_router(read_parameters)

@app.get("/")
async def root():
    return {"status": "ok"}

