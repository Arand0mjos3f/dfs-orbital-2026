from fastapi import APIRouter

from app.api.v1.endpoints import (
    debts,
    expenses,
    groups,
    health,
    item_shares,
    items,
    receipts,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(groups.router)
api_router.include_router(expenses.router)
api_router.include_router(receipts.router)
api_router.include_router(items.router)
api_router.include_router(item_shares.router)
api_router.include_router(debts.router)
