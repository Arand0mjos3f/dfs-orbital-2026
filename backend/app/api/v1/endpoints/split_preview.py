import uuid
from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.expense import get_expense
from app.crud.item import list_items_by_receipt
from app.crud.item_share import list_item_shares_by_item
from app.crud.receipt import list_receipts_by_expense
from app.db.database import get_db
from app.models.user import User


router = APIRouter(tags=["split_preview"])

TWO_PLACES = Decimal("0.01")


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES)


def _build_suggested_debts(
    group_id: uuid.UUID,
    balances: dict[uuid.UUID, Decimal],
) -> list[dict]:
    creditors = []
    debtors = []

    for user_id, balance in balances.items():
        balance = _round_money(balance)

        if balance > 0:
            creditors.append([user_id, balance])
        elif balance < 0:
            debtors.append([user_id, -balance])

    suggested_debts = []
    debtor_index = 0
    creditor_index = 0

    while debtor_index < len(debtors) and creditor_index < len(creditors):
        debtor_id, debtor_amount = debtors[debtor_index]
        creditor_id, creditor_amount = creditors[creditor_index]
        payment_amount = _round_money(min(debtor_amount, creditor_amount))

        if payment_amount > 0:
            suggested_debts.append(
                {
                    "group_id": group_id,
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

    return suggested_debts


@router.post("/expenses/{expense_id}/split/preview")
def preview_expense_split(
    expense_id: uuid.UUID,
    db: Session = Depends(get_db),
):
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

    user_summaries = defaultdict(
        lambda: {
            "item_subtotal": Decimal("0.00"),
            "tax_share": Decimal("0.00"),
            "service_charge_share": Decimal("0.00"),
            "total_share": Decimal("0.00"),
        }
    )
    balances = defaultdict(lambda: Decimal("0.00"))
    user_ids = set()
    receipt_previews = []
    warnings = []
    has_any_share = False

    for receipt in receipts:
        assigned_subtotal = Decimal("0.00")
        assigned_total = Decimal("0.00")
        item_count = 0
        item_share_count = 0
        items = list_items_by_receipt(db, receipt.id)

        user_ids.add(receipt.payer_id)

        for item in items:
            item_count += 1
            shares = list_item_shares_by_item(db, item.id)

            for share in shares:
                has_any_share = True
                item_share_count += 1
                user_ids.add(share.user_id)

                item_share_amount = _round_money(share.item_share_amount)
                tax_share_amount = _round_money(share.tax_share_amount)
                service_charge_share_amount = _round_money(
                    share.service_charge_share_amount
                )
                total_share_amount = _round_money(share.total_share_amount)

                user_summaries[share.user_id]["item_subtotal"] += item_share_amount
                user_summaries[share.user_id]["tax_share"] += tax_share_amount
                user_summaries[share.user_id][
                    "service_charge_share"
                ] += service_charge_share_amount
                user_summaries[share.user_id]["total_share"] += total_share_amount

                assigned_subtotal += item_share_amount
                assigned_total += total_share_amount
                balances[share.user_id] -= total_share_amount

        if assigned_total > 0:
            balances[receipt.payer_id] += _round_money(assigned_total)

        assigned_subtotal = _round_money(assigned_subtotal)
        assigned_total = _round_money(assigned_total)

        if assigned_subtotal != _round_money(receipt.subtotal_amount):
            warnings.append(
                {
                    "code": "RECEIPT_SUBTOTAL_MISMATCH",
                    "receipt_id": receipt.id,
                    "message": "Assigned item shares do not match receipt subtotal.",
                }
            )

        if assigned_total != _round_money(receipt.total_amount):
            warnings.append(
                {
                    "code": "RECEIPT_TOTAL_MISMATCH",
                    "receipt_id": receipt.id,
                    "message": "Assigned item shares do not match receipt total.",
                }
            )

        receipt_previews.append(
            {
                "id": receipt.id,
                "payer_id": receipt.payer_id,
                "subtotal_amount": receipt.subtotal_amount,
                "tax_amount": receipt.tax_amount,
                "service_charge_amount": receipt.service_charge_amount,
                "total_amount": receipt.total_amount,
                "item_count": item_count,
                "item_share_count": item_share_count,
                "assigned_subtotal_amount": assigned_subtotal,
                "assigned_total_amount": assigned_total,
            }
        )

    if not has_any_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "EXPENSE_NOT_READY",
                "message": "The expense has no item share records.",
            },
        )

    users_by_id = {
        user.id: user
        for user in db.execute(select(User).where(User.id.in_(user_ids))).scalars().all()
    }

    users = []
    for user_id in sorted(user_ids, key=str):
        summary = user_summaries[user_id]
        user = users_by_id.get(user_id)
        users.append(
            {
                "id": user_id,
                "username": user.username if user else None,
                "email": user.email if user else None,
                "item_subtotal": _round_money(summary["item_subtotal"]),
                "tax_share": _round_money(summary["tax_share"]),
                "service_charge_share": _round_money(
                    summary["service_charge_share"]
                ),
                "total_share": _round_money(summary["total_share"]),
            }
        )

    total_receipt_amount = _round_money(
        sum((receipt.total_amount for receipt in receipts), Decimal("0.00"))
    )
    total_user_share_amount = _round_money(
        sum((user["total_share"] for user in users), Decimal("0.00"))
    )

    return {
        "success": True,
        "data": {
            "users": users,
            "receipts": receipt_previews,
            "suggested_debts": _build_suggested_debts(expense.group_id, balances),
            "rounding": {
                "total_receipt_amount": total_receipt_amount,
                "total_user_share_amount": total_user_share_amount,
                "delta": _round_money(total_receipt_amount - total_user_share_amount),
            },
            "warnings": warnings,
        },
    }
