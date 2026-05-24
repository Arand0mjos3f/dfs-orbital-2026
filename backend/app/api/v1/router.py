from fastapi import APIRouter

<<<<<<< HEAD
from app.api.v1.endpoints import expenses, health, groups, users
=======
from app.api.v1.endpoints import expenses, health, item_shares, items, receipts
>>>>>>> 79e14c2606e01ef6b25cf9941ba6c6c6eef49c0e

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
<<<<<<< HEAD
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
=======
api_router.include_router(receipts.router)
api_router.include_router(items.router)
api_router.include_router(item_shares.router)
>>>>>>> 79e14c2606e01ef6b25cf9941ba6c6c6eef49c0e
