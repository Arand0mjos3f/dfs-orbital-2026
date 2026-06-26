import os
from pathlib import Path

from app.services.ocr_engine import get_ocr_engine
from app.services.receipt_parser import parse_receipt_text


DEFAULT_OCR_ENGINE = "mock"


def get_configured_ocr_engine_name() -> str:
    return os.getenv("OCR_ENGINE", DEFAULT_OCR_ENGINE).strip().lower()


def run_receipt_ocr(image_path: Path, engine_name: str | None = None) -> dict:
    """
    Run OCR and parse the extracted receipt text.

    Default engine is controlled by OCR_ENGINE:
    - OCR_ENGINE=mock
    - OCR_ENGINE=paddleocr
    """
    selected_engine_name = engine_name or get_configured_ocr_engine_name()

    ocr_engine = get_ocr_engine(selected_engine_name)
    raw_text = ocr_engine.extract_text(image_path)

    parsed_result = parse_receipt_text(raw_text)

    return {
        "raw_text": raw_text,
        **parsed_result,
    }


def run_mock_ocr(image_path: Path) -> dict:
    """
    Backward-compatible wrapper used by tests or legacy code.
    """
    return run_receipt_ocr(image_path, engine_name="mock")
