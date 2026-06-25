from pathlib import Path

from app.services.receipt_parser import parse_receipt_text


def run_mock_ocr(image_path: Path) -> dict:
    """
    Temporary mock OCR service for Milestone 2.

    This service simulates the OCR pipeline:
    receipt image -> raw OCR text -> parsed receipt items.

    Later this function can be replaced by PaddleOCR while keeping
    parse_receipt_text() as the receipt parsing layer.
    """
    raw_text = (
        "Chicken Rice 5.50\n"
        "Iced Lemon Tea 3.20\n"
        "GST 0.70\n"
        "SERVICE 1.30\n"
        "TOTAL 10.70"
    )

    parsed_result = parse_receipt_text(raw_text)

    return {
        "raw_text": raw_text,
        **parsed_result,
    }
