from functools import lru_cache
from pathlib import Path
from typing import Protocol


class OcrEngine(Protocol):
    def extract_text(self, image_path: Path) -> str:
        ...


class MockOcrEngine:
    """
    Mock OCR engine used for local development and stable tests.
    It simulates text extracted from a receipt image.
    """

    def extract_text(self, image_path: Path) -> str:
        return (
            "Chicken Rice 5.50\n"
            "Iced Lemon Tea 3.20\n"
            "GST 0.70\n"
            "SERVICE 1.30\n"
            "TOTAL 10.70"
        )


class PaddleOcrEngine:
    """
    PaddleOCR engine for real receipt image OCR.

    The deployed backend uses a cached engine instance because PaddleOCR model
    initialization is expensive on Render's free instance.
    """

    def __init__(self) -> None:
        try:
            from paddleocr import PaddleOCR
        except ImportError as exc:
            raise RuntimeError(
                "PaddleOCR is not installed. Use OCR_ENGINE=mock or install "
                "OCR dependencies from requirements-ocr.txt first."
            ) from exc

        self._ocr = PaddleOCR(
            lang="en",
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name="PP-OCRv5_mobile_rec",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            device="cpu",
            enable_mkldnn=False,
            cpu_threads=1,
        )

    def extract_text(self, image_path: Path) -> str:
        if not image_path.exists():
            raise FileNotFoundError(f"Receipt image not found: {image_path}")

        result = self._ocr.predict(str(image_path))

        return _extract_text_lines_from_paddle_result(result)


def _extract_text_lines_from_paddle_result(result) -> str:
    lines: list[str] = []

    for page_result in result or []:
        lines.extend(_extract_text_lines_from_page_result(page_result))

    return "\n".join(line for line in lines if line)


def _extract_text_lines_from_page_result(page_result) -> list[str]:
    """
    PaddleOCR 3.x may return result objects or dictionaries.
    This parser tries several common result shapes safely.
    """
    lines: list[str] = []

    if page_result is None:
        return lines

    if isinstance(page_result, dict):
        lines.extend(_extract_text_lines_from_dict(page_result))
        return lines

    if hasattr(page_result, "json"):
        try:
            json_result = page_result.json
            if callable(json_result):
                json_result = json_result()
            if isinstance(json_result, dict):
                lines.extend(_extract_text_lines_from_dict(json_result))
                return lines
        except Exception:
            pass

    if hasattr(page_result, "to_dict"):
        try:
            dict_result = page_result.to_dict()
            if isinstance(dict_result, dict):
                lines.extend(_extract_text_lines_from_dict(dict_result))
                return lines
        except Exception:
            pass

    if isinstance(page_result, (list, tuple)):
        for entry in page_result:
            text = _extract_text_from_legacy_entry(entry)
            if text:
                lines.append(text)

    return lines


def _extract_text_lines_from_dict(result_dict: dict) -> list[str]:
    possible_keys = [
        "rec_texts",
        "texts",
        "text",
        "ocr_text",
    ]

    for key in possible_keys:
        value = result_dict.get(key)

        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]

        if isinstance(value, str) and value.strip():
            return [value.strip()]

    data = result_dict.get("data")

    if isinstance(data, dict):
        return _extract_text_lines_from_dict(data)

    if isinstance(data, list):
        lines: list[str] = []

        for entry in data:
            if isinstance(entry, dict):
                lines.extend(_extract_text_lines_from_dict(entry))
            else:
                text = _extract_text_from_legacy_entry(entry)
                if text:
                    lines.append(text)

        return lines

    return []


def _extract_text_from_legacy_entry(entry) -> str | None:
    if not entry:
        return None

    if isinstance(entry, (list, tuple)) and len(entry) >= 2:
        text_info = entry[1]

        if isinstance(text_info, (list, tuple)) and len(text_info) >= 1:
            return str(text_info[0]).strip()

        if isinstance(text_info, str):
            return text_info.strip()

    if isinstance(entry, dict):
        lines = _extract_text_lines_from_dict(entry)
        if lines:
            return lines[0]

    return None


@lru_cache(maxsize=4)
def get_ocr_engine(engine_name: str = "mock") -> OcrEngine:
    if engine_name == "mock":
        return MockOcrEngine()

    if engine_name == "paddleocr":
        return PaddleOcrEngine()

    raise ValueError(f"Unsupported OCR engine: {engine_name}")
