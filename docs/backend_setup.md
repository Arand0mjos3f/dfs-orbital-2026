# Backend Setup Instructions

1. cd backend
2. python -m venv .venv
3. source .venv/bin/activate
4. pip install -r requirements.txt
5. uvicorn app.main:app --reload
6. Open http://127.0.0.1:8000/docs