import uuid
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.debt import (
    create_debt,
    get_debt,
    list_debts_by_expense,
    list_debts_by_group,
    update_debt,
)
from app.crud.expense import get_expense
from app.crud.group import get_group, get_group_member
from app.crud.item import list_items_by_receipt
from app.crud.item_share import list_item_shares_by_item
from app.crud.receipt import list_receipts_by_expense
from app.db.database import get_db
from app.schemas.debt import DebtMarkPaid, DebtRead


router = APIRouter(tags=["debts"])

TWO_PLACES = Decimal("0.01")


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES)


def _calculate_debt_specs_for_expense(db: Session, expense_id: uuid.UUID):
    expense = get_expense(db, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "EXPENSE_NOT_FOUND",
                "message": "The expense does not exist.",
            },
        )

    receipts = list_receipts_by_expense(db, expense_id)

    if not receipts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "EXPENSE_NOT_READY",
                "message": "The expense has no receipts.",
            },
        )

    balances = defaultdict(lambda: Decimal("0.00"))
    has_any_share = False

    for receipt in receipts:
        receipt_assigned_total = Decimal("0.00")
        items = list_items_by_receipt(db, receipt.id)

        for item in items:
            shares = list_item_shares_by_item(db, item.id)

            for share in shares:
                has_any_share = True
                amount = _round_money(share.total_share_amount)
                balances[share.user_id] -= amount
                receipt_assigned_total += amount

        if receipt_assigned_total > 0:
            balances[receipt.payer_id] += _round_money(receipt_assigned_total)

    if not has_any_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "EXPENSE_NOT_READY",
                "message": "The expense has no item share records.",
            },
        )

    creditors = []
    debtors = []

    for user_id, balance in balances.items():
        balance = _round_money(balance)

        if balance > 0:
            creditors.append([user_id, balance])
        elif balance < 0:
            debtors.append([user_id, -balance])

    debt_specs = []
    debtor_index = 0
    creditor_index = 0

    while debtor_index < len(debtors) and creditor_index < len(creditors):
        debtor_id, debtor_amount = debtors[debtor_index]
        creditor_id, creditor_amount = creditors[creditor_index]

        payment_amount = min(debtor_amount, creditor_amount)
        payment_amount = _round_money(payment_amount)

        if payment_amount > 0:
            debt_specs.append(
                {
                    "group_id": expense.group_id,
                    "expense_id": expense.id,
                    "from_user_id": debtor_id,
                    "to_user_id": creditor_id,
                    "amount": payment_amount,
                }
            )

        debtor_amount -= payment_amount
        creditor_amount -= payment_amount

        debtors[debtor_index][1] = debtor_amount
        creditors[creditor_index][1] = creditor_amount

        if debtor_amount <= 0:
            debtor_index += 1

        if creditor_amount <= 0:
            creditor_index += 1

    return debt_specs


@router.post(
    "/expenses/{expense_id}/debts/calculate",
    status_code=status.HTTP_201_CREATED,
)
def calculate_debts_for_expense(
    expense_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    existing_debts = list_debts_by_expense(db, expense_id)

    active_existing_debts = [
        debt for debt in existing_debts if debt.status != "cancelled"
    ]

    if active_existing_debts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DEBT_ALREADY_CALCULATED",
                "message": "Debts have already been calculated for this expense.",
            },
        )

    debt_specs = _calculate_debt_specs_for_expense(db, expense_id)

    created_debts = [
        create_debt(
            db,
            group_id=spec["group_id"],
            expense_id=spec["expense_id"],
            from_user_id=spec["from_user_id"],
            to_user_id=spec["to_user_id"],
            amount=spec["amount"],
            status="pending",
        )
        for spec in debt_specs
    ]

    return {
        "success": True,
        "data": [DebtRead.model_validate(debt) for debt in created_debts],
    }


@router.get("/groups/{group_id}/debts")
def get_debts_in_group(
    group_id: uuid.UUID,
    user_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    group = get_group(db, group_id)

    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "GROUP_NOT_FOUND",
                "message": "The group does not exist.",
            },
        )

    if user_id is not None:
        member = get_group_member(db, group_id, user_id)

        if member is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "NOT_GROUP_MEMBER",
                    "message": "The user is not a member of this group.",
                },
            )

    debts = list_debts_by_group(db, group_id)

    return {
        "success": True,
        "data": [DebtRead.model_validate(debt) for debt in debts],
    }


@router.patch("/debts/{debt_id}/mark-paid")
def mark_debt_as_paid(
    debt_id: uuid.UUID,
    debt_in: DebtMarkPaid,
    user_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    debt = get_debt(db, debt_id)

    if debt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "DEBT_NOT_FOUND",
                "message": "The debt record does not exist.",
            },
        )

    if debt.from_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "NOT_DEBT_PAYER",
                "message": "Only the payer can mark this debt as paid.",
            },
        )

    if debt.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_DEBT_STATUS",
                "message": "Only pending debts can be marked as paid.",
            },
        )

    updated_debt = update_debt(
        db,
        debt,
        {
            "status": "marked_paid",
            "payment_proof_url": debt_in.payment_proof_url,
            "marked_paid_at": datetime.now(timezone.utc),
        },
    )

    return {
        "success": True,
        "data": DebtRead.model_validate(updated_debt),
    }


@router.patch("/debts/{debt_id}/confirm-received")
def confirm_debt_received(
    debt_id: uuid.UUID,
    user_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    debt = get_debt(db, debt_id)

    if debt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "DEBT_NOT_FOUND",
                "message": "The debt record does not exist.",
            },
        )

    if debt.to_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "NOT_DEBT_RECEIVER",
                "message": "Only the receiver can confirm this debt.",
            },
        )

    if debt.status != "marked_paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_DEBT_STATUS",
                "message": "Only marked_paid debts can be confirmed.",
            },
        )

    now = datetime.now(timezone.utc)

    updated_debt = update_debt(
        db,
        debt,
        {
            "status": "confirmed_received",
            "confirmed_received_at": now,
            "settled_at": now,
        },
    )

    return {
        "success": True,
        "data": DebtRead.model_validate(updated_debt),
    }
