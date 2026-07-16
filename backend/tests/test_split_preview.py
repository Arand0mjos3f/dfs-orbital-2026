from decimal import Decimal

from app.api.v1.endpoints.split_preview import _allocate_amount_proportionally


def test_allocate_amount_proportionally_is_cent_safe_for_equal_split():
    result = _allocate_amount_proportionally(
        Decimal("10.00"),
        [Decimal("1.00"), Decimal("1.00"), Decimal("1.00")],
    )

    assert result == [Decimal("3.34"), Decimal("3.33"), Decimal("3.33")]
    assert sum(result) == Decimal("10.00")


def test_allocate_amount_proportionally_uses_base_amounts():
    result = _allocate_amount_proportionally(
        Decimal("1.00"),
        [Decimal("1.00"), Decimal("3.00")],
    )

    assert result == [Decimal("0.25"), Decimal("0.75")]
    assert sum(result) == Decimal("1.00")


def test_allocate_zero_amount_returns_zero_allocations():
    result = _allocate_amount_proportionally(
        Decimal("0.00"),
        [Decimal("1.00"), Decimal("3.00")],
    )

    assert result == [Decimal("0.00"), Decimal("0.00")]
