from decimal import Decimal
from pathlib import Path

from app.services.ocr_engine import MockOcrEngine, get_ocr_engine
from app.services.ocr_service import run_mock_ocr, run_receipt_ocr


def test_mock_ocr_engine_extracts_raw_text():
    engine = MockOcrEngine()

    raw_text = engine.extract_text(Path("fake_receipt.png"))

    assert "Chicken Rice 5.50" in raw_text
    assert "GST 0.70" in raw_text
    assert "TOTAL 10.70" in raw_text


def test_get_mock_ocr_engine():
    engine = get_ocr_engine("mock")

    raw_text = engine.extract_text(Path("fake_receipt.png"))

    assert "Iced Lemon Tea 3.20" in raw_text


def test_run_receipt_ocr_with_mock_engine():
    result = run_receipt_ocr(Path("fake_receipt.png"), engine_name="mock")

    assert result["raw_text"]
    assert len(result["items"]) == 2
    assert result["subtotal_amount"] == Decimal("8.70")
    assert result["tax_amount"] == Decimal("0.70")
    assert result["service_charge_amount"] == Decimal("1.30")
    assert result["total_amount"] == Decimal("10.70")


def test_run_mock_ocr_keeps_backward_compatible_output():
    result = run_mock_ocr(Path("fake_receipt.png"))

    assert result["raw_text"]
    assert len(result["items"]) == 2
    assert result["items"][0]["name"] == "Chicken Rice"
    assert result["items"][1]["name"] == "Iced Lemon Tea"
    assert result["total_amount"] == Decimal("10.70")
