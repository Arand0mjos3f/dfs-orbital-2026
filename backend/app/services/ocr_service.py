from decimal import Decimal
from pathlib import Path
from uuid import UUID


def run_mock_ocr(image_path: Path) -> dict:
    """
    Temporary mock OCR service for Milestone 2.
    Later this function will be replaced by PaddleOCR.
    """
    mock_items = [
        {
            "name": "Chicken Rice",
            "original_name": "Chicken Rice",
            "unit_price": Decimal("5.50"),
            "quantity": 1,
            "total_price": Decimal("5.50"),
            "is_manually_edited": False,
        },
        {
            "name": "Iced Lemon Tea",
            "original_name": "Iced Lemon Tea",
            "unit_price": Decimal("3.20"),
            "quantity": 1,
            "total_price": Decimal("3.20"),
            "is_manually_edited": False,
        },
    ]

    raw_text = "Chicken Rice 5.50\nIced Lemon Tea 3.20\nTOTAL 8.70"

    return {
        "raw_text": raw_text,
        "items": mock_items,
        "subtotal_amount": Decimal("8.70"),
        "tax_amount": Decimal("0.00"),
        "service_charge_amount": Decimal("0.00"),
        "total_amount": Decimal("8.70"),
    }