from decimal import Decimal

from sqlalchemy import select

from app.crud.expense import create_expense
from app.crud.group import create_group, create_group_member
from app.crud.item import create_item
from app.crud.item_share import create_item_share
from app.crud.receipt import create_receipt
from app.crud.user import create_user
from app.models.item import Item
from app.models.item_share import ItemShare


def _create_receipt_context(db):
    payer = create_user(
        db,
        username="Batch Payer",
        email="batch.payer@example.com",
        password_hash="password123",
    )
    member = create_user(
        db,
        username="Batch Member",
        email="batch.member@example.com",
        password_hash="password123",
    )
    group = create_group(
        db,
        name="Batch Group",
        description="Batch item API tests",
        created_by_id=payer.id,
    )
    create_group_member(db, group_id=group.id, user_id=payer.id, role="owner")
    create_group_member(db, group_id=group.id, user_id=member.id, role="member")
    expense = create_expense(
        db,
        group_id=group.id,
        title="Batch Expense",
        description="Receipt review",
        created_by_id=payer.id,
    )
    receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=payer.id,
        subtotal_amount=Decimal("12.00"),
        tax_amount=Decimal("0.00"),
        service_charge_amount=Decimal("0.00"),
        total_amount=Decimal("12.00"),
    )

    return payer, member, receipt


def test_batch_replace_existing_clears_old_shares_and_preserves_ocr_fields(client, db):
    payer, member, receipt = _create_receipt_context(db)
    old_item = create_item(
        db,
        receipt_id=receipt.id,
        name="Old Soup",
        quantity=1,
        unit_price=Decimal("4.00"),
        total_price=Decimal("4.00"),
    )
    old_share = create_item_share(
        db,
        item_id=old_item.id,
        user_id=member.id,
        item_share_amount=Decimal("4.00"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("4.00"),
    )

    response = client.post(
        f"/api/v1/receipts/{receipt.id}/items/batch",
        json={
            "replace_existing": True,
            "items": [
                {
                    "name": "Reviewed Kaya Toast",
                    "quantity": 2,
                    "unit_price": "3.50",
                    "total_price": "7.00",
                    "original_name": "Kaya Toa5t",
                    "original_unit_price": "3.45",
                    "original_total_price": "6.90",
                    "is_manually_edited": True,
                }
            ],
        },
    )

    assert response.status_code == 201
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "Reviewed Kaya Toast"
    assert data[0]["original_name"] == "Kaya Toa5t"
    assert Decimal(data[0]["original_unit_price"]) == Decimal("3.45")
    assert Decimal(data[0]["original_total_price"]) == Decimal("6.90")
    assert data[0]["is_manually_edited"] is True

    assert db.get(ItemShare, old_share.id) is None
    assert db.get(Item, old_item.id) is None

    remaining_items = db.execute(
        select(Item).where(Item.receipt_id == receipt.id)
    ).scalars().all()
    assert [item.name for item in remaining_items] == ["Reviewed Kaya Toast"]


def test_batch_append_when_replace_existing_false_keeps_existing_items(client, db):
    _, _, receipt = _create_receipt_context(db)
    create_item(
        db,
        receipt_id=receipt.id,
        name="Existing Noodles",
        quantity=1,
        unit_price=Decimal("5.00"),
        total_price=Decimal("5.00"),
    )

    response = client.post(
        f"/api/v1/receipts/{receipt.id}/items/batch",
        json={
            "replace_existing": False,
            "items": [
                {
                    "name": "Added Kopi",
                    "quantity": 1,
                    "unit_price": "2.00",
                    "total_price": "2.00",
                }
            ],
        },
    )

    assert response.status_code == 201
    item_names = [
        item.name
        for item in db.execute(
            select(Item).where(Item.receipt_id == receipt.id)
        ).scalars().all()
    ]
    assert sorted(item_names) == ["Added Kopi", "Existing Noodles"]


def test_batch_invalid_item_total_returns_stable_error_code(client, db):
    _, _, receipt = _create_receipt_context(db)

    response = client.post(
        f"/api/v1/receipts/{receipt.id}/items/batch",
        json={
            "replace_existing": True,
            "items": [
                {
                    "name": "Mismatched Total",
                    "quantity": 2,
                    "unit_price": "3.00",
                    "total_price": "7.00",
                }
            ],
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "INVALID_ITEM_TOTAL"


def test_batch_empty_items_returns_validation_error(client, db):
    _, _, receipt = _create_receipt_context(db)

    response = client.post(
        f"/api/v1/receipts/{receipt.id}/items/batch",
        json={
            "replace_existing": True,
            "items": [],
        },
    )

    assert response.status_code == 422
