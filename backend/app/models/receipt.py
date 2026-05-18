import uuid
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    expense_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("expenses.id"),
        nullable=False,
    )
    payer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    raw_ocr_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    subtotal_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    service_charge_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    source_type: Mapped[str] = mapped_column(String(50), nullable=False, default="manual")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")

    uploaded_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
