from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.user import create_user, get_user_by_email, list_users
from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()


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
    existing_user = get_user_by_email(db, user_in.email)

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    return create_user(
        db=db,
        username=user_in.username,
        email=user_in.email,
        password_hash=user_in.password,
        avatar_url=user_in.avatar_url,
    )