from decimal import Decimal

from app.api.v1.endpoints.debts import get_group_debt_summary
from app.crud.debt import create_debt
from app.crud.group import create_group, create_group_member
from app.crud.user import create_user


def test_group_debt_summary_counts_outstanding_and_member_balances(db):
    sixian = create_user(
        db,
        username="Sixian",
        email="sixian.summary.test@example.com",
        password_hash="password123",
    )
    jingyi = create_user(
        db,
        username="Jingyi",
        email="jingyi.summary.test@example.com",
        password_hash="password123",
    )
    maahir = create_user(
        db,
        username="Maahir",
        email="maahir.summary.test@example.com",
        password_hash="password123",
    )

    group = create_group(
        db,
        name="Summary Test Group",
        description="Group debt summary test",
        created_by_id=sixian.id,
    )

    create_group_member(db, group_id=group.id, user_id=sixian.id, role="owner")
    create_group_member(db, group_id=group.id, user_id=jingyi.id, role="member")
    create_group_member(db, group_id=group.id, user_id=maahir.id, role="member")

    create_debt(
        db,
        group_id=group.id,
        from_user_id=jingyi.id,
        to_user_id=sixian.id,
        amount=Decimal("3.38"),
        status="pending",
    )
    create_debt(
        db,
        group_id=group.id,
        from_user_id=maahir.id,
        to_user_id=sixian.id,
        amount=Decimal("4.20"),
        status="marked_paid",
    )
    create_debt(
        db,
        group_id=group.id,
        from_user_id=sixian.id,
        to_user_id=jingyi.id,
        amount=Decimal("1.00"),
        status="confirmed_received",
    )
    create_debt(
        db,
        group_id=group.id,
        from_user_id=maahir.id,
        to_user_id=jingyi.id,
        amount=Decimal("9.99"),
        status="cancelled",
    )

    response = get_group_debt_summary(group.id, sixian.id, db)
    summary = response["data"]

    assert response["success"] is True
    assert summary.group_id == group.id
    assert summary.outstanding_amount == Decimal("7.58")
    assert summary.outstanding_debt_count == 2
    assert summary.settled_debt_count == 1

    summaries_by_user = {
        member_summary.user_id: member_summary
        for member_summary in summary.member_summaries
    }

    sixian_summary = summaries_by_user[sixian.id]
    jingyi_summary = summaries_by_user[jingyi.id]
    maahir_summary = summaries_by_user[maahir.id]

    assert sixian_summary.owes_amount == Decimal("0.00")
    assert sixian_summary.owed_amount == Decimal("7.58")
    assert sixian_summary.net_amount == Decimal("7.58")
    assert sixian_summary.outstanding_transaction_count == 2

    assert jingyi_summary.owes_amount == Decimal("3.38")
    assert jingyi_summary.owed_amount == Decimal("0.00")
    assert jingyi_summary.net_amount == Decimal("-3.38")
    assert jingyi_summary.outstanding_transaction_count == 1

    assert maahir_summary.owes_amount == Decimal("4.20")
    assert maahir_summary.owed_amount == Decimal("0.00")
    assert maahir_summary.net_amount == Decimal("-4.20")
    assert maahir_summary.outstanding_transaction_count == 1