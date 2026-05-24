from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # NEW IMPORT
from app.api.v1.router import api_router

app = FastAPI(title="DFS Orbital 2026")

# --- NEW CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Allow React
    allow_credentials=True,
    allow_methods=["*"], # Allow GET, POST, PUT, DELETE
    allow_headers=["*"], # Allow all headers
)
# ------------------------------

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to DFS Orbital API"}