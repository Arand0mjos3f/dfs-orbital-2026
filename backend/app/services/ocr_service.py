from pathlib import Path

from app.services.ocr_engine import get_ocr_engine
from app.services.receipt_parser import parse_receipt_text


def run_receipt_ocr(image_path: Path, engine_name: str = "mock") -> dict:
    """
    Run OCR and parse the extracted receipt text.

    Current Milestone 2 default:
    image_path -> MockOcrEngine -> raw_text -> receipt_parser -> structured data

    Later:
    image_path -> PaddleOcrEngine -> raw_text -> receipt_parser -> structured data
    """
    ocr_engine = get_ocr_engine(engine_name)
    raw_text = ocr_engine.extract_text(image_path)

    parsed_result = parse_receipt_text(raw_text)

    return {
        "raw_text": raw_text,
        **parsed_result,
    }


def run_mock_ocr(image_path: Path) -> dict:
    """
    Backward-compatible wrapper used by the existing receipt upload endpoint.
    """
    return run_receipt_ocr(image_path, engine_name="mock")
