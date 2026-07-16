from collections import defaultdict
from decimal import Decimal
import uuid

from app.api.v1.endpoints.split_preview import (
    _allocate_amount_proportionally,
    _build_suggested_debts,
)


def test_equal_split_rounding_is_cent_safe():
    result = _allocate_amount_proportionally(
        Decimal("10.00"),
        [Decimal("1.00"), Decimal("1.00"), Decimal("1.00")],
    )

    assert result == [Decimal("3.34"), Decimal("3.33"), Decimal("3.33")]
    assert sum(result) == Decimal("10.00")


def test_proportional_tax_allocation_by_item_share():
    result = _allocate_amount_proportionally(
        Decimal("1.20"),
        [Decimal("5.00"), Decimal("15.00")],
    )

    assert result == [Decimal("0.30"), Decimal("0.90")]
    assert sum(result) == Decimal("1.20")


def test_one_cent_remainder_is_assigned_deterministically():
    result = _allocate_amount_proportionally(
        Decimal("0.01"),
        [Decimal("1.00"), Decimal("1.00"), Decimal("1.00")],
    )

    assert result == [Decimal("0.01"), Decimal("0.00"), Decimal("0.00")]
    assert sum(result) == Decimal("0.01")


def test_zero_allocation_returns_zero_for_each_user():
    result = _allocate_amount_proportionally(
        Decimal("0.00"),
        [Decimal("5.00"), Decimal("15.00")],
    )

    assert result == [Decimal("0.00"), Decimal("0.00")]
    assert sum(result) == Decimal("0.00")


def test_suggested_debts_single_payer_two_debtors():
    group_id = uuid.uuid4()
    expense_id = uuid.uuid4()
    payer = uuid.uuid4()
    user_b = uuid.uuid4()
    user_c = uuid.uuid4()

    balances = defaultdict(lambda: Decimal("0.00"))
    balances[payer] = Decimal("30.00")
    balances[user_b] = Decimal("-10.00")
    balances[user_c] = Decimal("-20.00")

    result = _build_suggested_debts(
        group_id=group_id,
        expense_id=expense_id,
        balances=balances,
    )

    assert len(result) == 2
    assert sum(Decimal(row["amount"]) for row in result) == Decimal("30.00")

    assert {row["to_user_id"] for row in result} == {str(payer)}
    assert {row["from_user_id"] for row in result} == {str(user_b), str(user_c)}


def test_suggested_debts_offsets_multiple_creditors_and_debtors():
    group_id = uuid.uuid4()
    expense_id = uuid.uuid4()
    user_a = uuid.uuid4()
    user_b = uuid.uuid4()
    user_c = uuid.uuid4()
    user_d = uuid.uuid4()

    balances = defaultdict(lambda: Decimal("0.00"))
    balances[user_a] = Decimal("15.00")
    balances[user_b] = Decimal("5.00")
    balances[user_c] = Decimal("-7.00")
    balances[user_d] = Decimal("-13.00")

    result = _build_suggested_debts(
        group_id=group_id,
        expense_id=expense_id,
        balances=balances,
    )

    assert sum(Decimal(row["amount"]) for row in result) == Decimal("20.00")
    assert sum(
        Decimal(row["amount"])
        for row in result
        if row["to_user_id"] == str(user_a)
    ) == Decimal("15.00")
    assert sum(
        Decimal(row["amount"])
        for row in result
        if row["to_user_id"] == str(user_b)
    ) == Decimal("5.00")


def test_suggested_debts_empty_when_balances_cancel_out():
    group_id = uuid.uuid4()
    expense_id = uuid.uuid4()
    user_a = uuid.uuid4()
    user_b = uuid.uuid4()

    balances = defaultdict(lambda: Decimal("0.00"))
    balances[user_a] = Decimal("0.00")
    balances[user_b] = Decimal("0.00")

    result = _build_suggested_debts(
        group_id=group_id,
        expense_id=expense_id,
        balances=balances,
    )

    assert result == []
