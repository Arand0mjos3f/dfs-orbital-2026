from pathlib import Path
from typing import Protocol


class OcrEngine(Protocol):
    def extract_text(self, image_path: Path) -> str:
        ...


class MockOcrEngine:
    """
    Mock OCR engine used for local development and stable tests.

    It simulates text extracted from a real receipt image.
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
    Optional PaddleOCR engine.

    This class is not used by default yet. It is prepared for the later
    PaddleOCR integration step, while keeping the current mock workflow stable.
    """

    def __init__(self) -> None:
        try:
            from paddleocr import PaddleOCR
        except ImportError as exc:
            raise RuntimeError(
                "PaddleOCR is not installed. Install it before using PaddleOcrEngine."
            ) from exc

        self._ocr = PaddleOCR(use_angle_cls=True, lang="en")

    def extract_text(self, image_path: Path) -> str:
        result = self._ocr.ocr(str(image_path), cls=True)

        lines: list[str] = []

        for page in result or []:
            for entry in page or []:
                if not entry or len(entry) < 2:
                    continue

                text_info = entry[1]

                if isinstance(text_info, (list, tuple)) and len(text_info) > 0:
                    lines.append(str(text_info[0]))

        return "\n".join(lines)


def get_ocr_engine(engine_name: str = "mock") -> OcrEngine:
    if engine_name == "mock":
        return MockOcrEngine()

    if engine_name == "paddleocr":
        return PaddleOcrEngine()

    raise ValueError(f"Unsupported OCR engine: {engine_name}")
