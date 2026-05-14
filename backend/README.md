# DFS Backend

FastAPI backend for the Debt-First Search shared expense splitting app.

## Local development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Useful endpoints:

- `GET /` - API metadata
- `GET /api/v1/health` - health check
- `GET /api/v1/expenses` - list in-memory expenses
- `POST /api/v1/expenses` - create an in-memory expense

Interactive API docs are available at `GET /docs` when the server is running.
