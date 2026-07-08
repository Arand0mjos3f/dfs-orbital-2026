from decimal import Decimal

from app.api.v1.endpoints.item_shares import allocate_receipt_charges_to_item_shares
from app.crud.expense import create_expense
from app.crud.group import create_group, create_group_member
from app.crud.item import create_item
from app.crud.item_share import create_item_share
from app.crud.receipt import create_receipt
from app.crud.user import create_user


def test_allocate_receipt_charges_proportionally_updates_share_totals(db):
    sixian = create_user(
        db,
        username="Sixian",
        email="sixian.charge.test@example.com",
        password_hash="password123",
    )
    jingyi = create_user(
        db,
        username="Jingyi",
        email="jingyi.charge.test@example.com",
        password_hash="password123",
    )

    group = create_group(
        db,
        name="Charge Allocation Test Group",
        description="Tax and service allocation test",
        created_by_id=sixian.id,
    )

    create_group_member(db, group_id=group.id, user_id=sixian.id, role="owner")
    create_group_member(db, group_id=group.id, user_id=jingyi.id, role="member")

    expense = create_expense(
        db,
        group_id=group.id,
        title="Hotpot Charge Allocation",
        description="Shared meal with tax and service",
        created_by_id=sixian.id,
    )

    receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=sixian.id,
        subtotal_amount=Decimal("8.70"),
        tax_amount=Decimal("0.70"),
        service_charge_amount=Decimal("1.30"),
        total_amount=Decimal("10.70"),
    )

    tea = create_item(
        db,
        receipt_id=receipt.id,
        name="Iced Lemon Tea",
        quantity=1,
        unit_price=Decimal("3.20"),
        total_price=Decimal("3.20"),
    )
    chicken = create_item(
        db,
        receipt_id=receipt.id,
        name="Chicken Rice",
        quantity=1,
        unit_price=Decimal("5.50"),
        total_price=Decimal("5.50"),
    )

    create_item_share(
        db,
        item_id=tea.id,
        user_id=sixian.id,
        item_share_amount=Decimal("3.20"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("3.20"),
    )
    create_item_share(
        db,
        item_id=chicken.id,
        user_id=sixian.id,
        item_share_amount=Decimal("2.75"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("2.75"),
    )
    create_item_share(
        db,
        item_id=chicken.id,
        user_id=jingyi.id,
        item_share_amount=Decimal("2.75"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("2.75"),
    )

    allocation = allocate_receipt_charges_to_item_shares(receipt.id, db)
    data = allocation["data"]

    assert allocation["success"] is True
    assert data.item_share_count == 3
    assert data.item_subtotal_amount == Decimal("8.70")
    assert data.tax_amount == Decimal("0.70")
    assert data.service_charge_amount == Decimal("1.30")
    assert data.total_allocated_amount == Decimal("10.70")

    shares_by_item_and_user = {
        (share.item_id, share.user_id): share
        for share in data.shares
    }

    tea_sixian = shares_by_item_and_user[(tea.id, sixian.id)]
    chicken_sixian = shares_by_item_and_user[(chicken.id, sixian.id)]
    chicken_jingyi = shares_by_item_and_user[(chicken.id, jingyi.id)]

    assert tea_sixian.item_share_amount == Decimal("3.20")
    assert tea_sixian.tax_share_amount == Decimal("0.26")
    assert tea_sixian.service_charge_share_amount == Decimal("0.48")
    assert tea_sixian.total_share_amount == Decimal("3.94")

    assert chicken_sixian.item_share_amount == Decimal("2.75")
    assert chicken_sixian.tax_share_amount == Decimal("0.22")
    assert chicken_sixian.service_charge_share_amount == Decimal("0.41")
    assert chicken_sixian.total_share_amount == Decimal("3.38")

    assert chicken_jingyi.item_share_amount == Decimal("2.75")
    assert chicken_jingyi.tax_share_amount == Decimal("0.22")
    assert chicken_jingyi.service_charge_share_amount == Decimal("0.41")
    assert chicken_jingyi.total_share_amount == Decimal("3.38")