import os
from pathlib import Path

import pytest

from app.services.ocr_engine import PaddleOcrEngine


@pytest.mark.skipif(
    os.getenv("RUN_PADDLEOCR_TESTS") != "1",
    reason="PaddleOCR integration test is disabled by default.",
)
def test_paddleocr_engine_extracts_text_from_real_receipt():
    image_path = Path(os.getenv("PADDLEOCR_TEST_IMAGE", "tmp/test_receipts/real_receipt.jpg"))

    if not image_path.exists():
        pytest.skip(f"Test image does not exist: {image_path}")

    engine = PaddleOcrEngine()
    raw_text = engine.extract_text(image_path)

    assert isinstance(raw_text, str)
    assert raw_text.strip()
