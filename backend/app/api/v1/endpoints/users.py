from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    password_needs_upgrade,
    verify_password,
)
from app.crud.user import create_user, get_user_by_email, list_users
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter()

DEMO_EMAIL_ALIASES = {
    "sixian@example.com": "sixian.demo@example.com",
    "sixian.demo@example.com": "sixian@example.com",
}


@router.get("/", response_model=list[UserResponse])
def get_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return list_users(db, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    normalized_email = str(user_in.email).strip().lower()
    normalized_username = user_in.username.strip()

    if not normalized_username:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username cannot be empty.",
        )

    existing_user = get_user_by_email(db, normalized_email)

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    return create_user(
        db=db,
        username=normalized_username,
        email=normalized_email,
        password_hash=hash_password(user_in.password),
        avatar_url=user_in.avatar_url,
    )


@router.post("/login", response_model=UserResponse)
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    normalized_email = str(credentials.email).strip().lower()
    user = get_user_by_email(db, normalized_email)

    if user is None and normalized_email in DEMO_EMAIL_ALIASES:
        user = get_user_by_email(
            db,
            DEMO_EMAIL_ALIASES[normalized_email],
        )

    if user is None or not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if password_needs_upgrade(user.password_hash):
        user.password_hash = hash_password(credentials.password)
        db.commit()
        db.refresh(user)

    return user
