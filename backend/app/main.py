import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.v1.router import api_router
from app.db.database import SessionLocal
from app.models.user import User


DEMO_USERS = [
    {
        "id": uuid.UUID("16ab9e31-56f1-4afc-8d2f-09f45dfd57da"),
        "username": "Sixian",
        "email": "sixian@example.com",
        "password_hash": "password123",
        "avatar_url": "",
    },
    {
        "id": uuid.UUID("facda849-579e-48d6-a589-b160f0533bf5"),
        "username": "Jingyi",
        "email": "jingyi.demo@example.com",
        "password_hash": "password123",
        "avatar_url": "",
    },
]


def seed_demo_users() -> None:
    db = SessionLocal()

    try:
        for user_data in DEMO_USERS:
            existing_user = db.get(User, user_data["id"])
            existing_email_user = db.execute(
                select(User).where(User.email == user_data["email"])
            ).scalar_one_or_none()

            if existing_user is None and existing_email_user is None:
                db.add(User(**user_data))

        db.commit()
    except Exception as error:
        db.rollback()
        print(f"Demo user seed skipped: {error}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_demo_users()
    yield


app = FastAPI(title="DFS Orbital 2026", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://dfs-orbital-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to DFS Orbital API"}