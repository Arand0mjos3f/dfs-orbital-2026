import uuid
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.expense import get_expense
from app.crud.item import list_items_by_receipt
from app.crud.item_share import list_item_shares_by_item
from app.crud.receipt import list_receipts_by_expense
from app.db.database import get_db


router = APIRouter(tags=["split-preview"])

TWO_PLACES = Decimal("0.01")


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def _money_to_cents(value: Decimal) -> int:
    rounded_value = _round_money(value)
    return int((rounded_value * Decimal("100")).to_integral_value(rounding=ROUND_HALF_UP))


def _cents_to_money(value: int) -> Decimal:
    return (Decimal(value) / Decimal("100")).quantize(TWO_PLACES)


def _format_money(value: Decimal) -> str:
    return str(_round_money(value))


def _allocate_amount_proportionally(
    total_amount: Decimal,
    base_amounts: list[Decimal],
) -> list[Decimal]:
    """
    Allocate total_amount proportionally across base_amounts in cents.

    This uses a deterministic largest-remainder method:
    - convert all values to cents
    - allocate floor proportional cents first
    - distribute remaining cents to the largest remainders
    - tie-break by original order

    Example:
    10.00 split across [1, 1, 1] becomes [3.34, 3.33, 3.33].
    """
    total_cents = _money_to_cents(total_amount)
    base_cents = [_money_to_cents(amount) for amount in base_amounts]
    base_total_cents = sum(base_cents)

    if total_cents == 0:
        return [_cents_to_money(0) for _ in base_amounts]

    if base_total_cents <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_ALLOCATION_BASE",
                "message": "Cannot allocate a non-zero amount without positive item shares.",
            },
        )

    allocation_rows = []

    for index, base_cent in enumerate(base_cents):
        numerator = total_cents * base_cent
        allocated_cents = numerator // base_total_cents
        remainder = numerator % base_total_cents

        allocation_rows.append(
            {
                "index": index,
                "allocated_cents": allocated_cents,
                "remainder": remainder,
            }
        )

    allocated_total_cents = sum(row["allocated_cents"] for row in allocation_rows)
    remaining_cents = total_cents - allocated_total_cents

    allocation_rows_by_remainder = sorted(
        allocation_rows,
        key=lambda row: (-row["remainder"], row["index"]),
    )

    for row in allocation_rows_by_remainder[:remaining_cents]:
        row["allocated_cents"] += 1

    allocation_rows = sorted(allocation_rows, key=lambda row: row["index"])

    return [_cents_to_money(row["allocated_cents"]) for row in allocation_rows]


def _build_suggested_debts(
    *,
    group_id: uuid.UUID,
    expense_id: uuid.UUID,
    balances: dict[uuid.UUID, Decimal],
) -> list[dict]:
    creditors = []
    debtors = []

    for user_id, balance in sorted(balances.items(), key=lambda item: str(item[0])):
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
                    "group_id": str(group_id),
                    "expense_id": str(expense_id),
                    "from_user_id": str(debtor_id),
                    "to_user_id": str(creditor_id),
                    "amount": _format_money(payment_amount),
                }
            )

        debtor_amount = _round_money(debtor_amount - payment_amount)
        creditor_amount = _round_money(creditor_amount - payment_amount)

        debtors[debtor_index][1] = debtor_amount
        creditors[creditor_index][1] = creditor_amount

        if debtor_amount <= 0:
            debtor_index += 1

        if creditor_amount <= 0:
            creditor_index += 1

    return suggested_debts


def _empty_user_summary(user_id: uuid.UUID) -> dict:
    return {
        "user_id": str(user_id),
        "item_subtotal": Decimal("0.00"),
        "tax_share": Decimal("0.00"),
        "service_charge_share": Decimal("0.00"),
        "total_share": Decimal("0.00"),
    }


def _serialise_user_summary(summary: dict) -> dict:
    return {
        "user_id": summary["user_id"],
        "item_subtotal": _format_money(summary["item_subtotal"]),
        "tax_share": _format_money(summary["tax_share"]),
        "service_charge_share": _format_money(summary["service_charge_share"]),
        "total_share": _format_money(summary["total_share"]),
    }


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

    user_summaries: dict[uuid.UUID, dict] = {}
    balances = defaultdict(lambda: Decimal("0.00"))
    receipt_previews = []
    warnings = []
    has_any_share = False

    for receipt in receipts:
        receipt_user_item_subtotals = defaultdict(lambda: Decimal("0.00"))

        items = list_items_by_receipt(db, receipt.id)

        for item in items:
            item_shares = list_item_shares_by_item(db, item.id)

            for item_share in item_shares:
                has_any_share = True
                item_share_amount = _round_money(item_share.item_share_amount)
                receipt_user_item_subtotals[item_share.user_id] += item_share_amount

        if not receipt_user_item_subtotals:
            warnings.append(
                {
                    "receipt_id": str(receipt.id),
                    "code": "RECEIPT_HAS_NO_ITEM_SHARES",
                    "message": "This receipt has no item shares and is excluded from the split preview.",
                }
            )
            continue

        ordered_user_ids = sorted(
            receipt_user_item_subtotals.keys(),
            key=lambda user_id: str(user_id),
        )

        base_amounts = [
            _round_money(receipt_user_item_subtotals[user_id])
            for user_id in ordered_user_ids
        ]

        tax_allocations = _allocate_amount_proportionally(
            _round_money(receipt.tax_amount),
            base_amounts,
        )
        service_allocations = _allocate_amount_proportionally(
            _round_money(receipt.service_charge_amount),
            base_amounts,
        )

        receipt_user_rows = []
        receipt_allocated_total = Decimal("0.00")
        receipt_item_subtotal_from_shares = _round_money(sum(base_amounts, Decimal("0.00")))

        if receipt_item_subtotal_from_shares != _round_money(receipt.subtotal_amount):
            warnings.append(
                {
                    "receipt_id": str(receipt.id),
                    "code": "RECEIPT_SUBTOTAL_MISMATCH",
                    "message": "The assigned item subtotal does not match the receipt subtotal.",
                    "receipt_subtotal": _format_money(receipt.subtotal_amount),
                    "assigned_item_subtotal": _format_money(receipt_item_subtotal_from_shares),
                }
            )

        for index, user_id in enumerate(ordered_user_ids):
            item_subtotal = base_amounts[index]
            tax_share = tax_allocations[index]
            service_charge_share = service_allocations[index]
            total_share = _round_money(item_subtotal + tax_share + service_charge_share)

            if user_id not in user_summaries:
                user_summaries[user_id] = _empty_user_summary(user_id)

            user_summaries[user_id]["item_subtotal"] += item_subtotal
            user_summaries[user_id]["tax_share"] += tax_share
            user_summaries[user_id]["service_charge_share"] += service_charge_share
            user_summaries[user_id]["total_share"] += total_share

            balances[user_id] -= total_share
            receipt_allocated_total += total_share

            receipt_user_rows.append(
                {
                    "user_id": str(user_id),
                    "item_subtotal": _format_money(item_subtotal),
                    "tax_share": _format_money(tax_share),
                    "service_charge_share": _format_money(service_charge_share),
                    "total_share": _format_money(total_share),
                }
            )

        receipt_allocated_total = _round_money(receipt_allocated_total)
        balances[receipt.payer_id] += receipt_allocated_total

        if receipt_allocated_total != _round_money(receipt.total_amount):
            warnings.append(
                {
                    "receipt_id": str(receipt.id),
                    "code": "RECEIPT_TOTAL_MISMATCH",
                    "message": "The allocated receipt total does not match the stored receipt total.",
                    "receipt_total": _format_money(receipt.total_amount),
                    "allocated_total": _format_money(receipt_allocated_total),
                }
            )

        receipt_previews.append(
            {
                "receipt_id": str(receipt.id),
                "payer_id": str(receipt.payer_id),
                "item_subtotal": _format_money(receipt_item_subtotal_from_shares),
                "tax_amount": _format_money(receipt.tax_amount),
                "service_charge_amount": _format_money(receipt.service_charge_amount),
                "allocated_total": _format_money(receipt_allocated_total),
                "users": receipt_user_rows,
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

    serialised_user_summaries = [
        _serialise_user_summary(user_summaries[user_id])
        for user_id in sorted(user_summaries.keys(), key=lambda user_id: str(user_id))
    ]

    suggested_debts = _build_suggested_debts(
        group_id=expense.group_id,
        expense_id=expense.id,
        balances=balances,
    )

    return {
        "success": True,
        "data": {
            "expense_id": str(expense.id),
            "group_id": str(expense.group_id),
            "users": serialised_user_summaries,
            "receipts": receipt_previews,
            "suggested_debts": suggested_debts,
            "rounding": {
                "currency_precision": 2,
                "is_cent_safe": True,
                "strategy": "largest_remainder_by_user_id",
            },
            "warnings": warnings,
        },
    }
