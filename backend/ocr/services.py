import fitz  # PyMuPDF
import google.generativeai as genai
from PIL import Image
import io
import os
import base64
from django.conf import settings


def _configure_gemini():
    api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in settings or environment variables.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash')


def is_pdf_scanned(pdf_path):
    """Check if PDF has extractable text or is scanned."""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text = page.get_text()
            if text.strip():
                doc.close()
                return False  # Has text → digital PDF
        doc.close()
        return True  # No text → scanned PDF
    except Exception:
        return True


def extract_text_from_pdf(pdf_path):
    """Extract text from a digital (text-based) PDF using PyMuPDF."""
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def extract_text_from_scanned_pdf(pdf_path):
    """
    Extract text from a scanned PDF using Gemini Vision API.
    Each page is converted to an image and sent to Gemini.
    """
    model = _configure_gemini()
    full_text = ""
    doc = fitz.open(pdf_path)

    for page_num, page in enumerate(doc):
        # Render page to image at 150 DPI
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")

        # Convert to PIL Image for Gemini
        img = Image.open(io.BytesIO(img_bytes))

        prompt = (
            "You are an OCR engine. Extract ALL text from this document image exactly as it appears. "
            "Preserve the structure, headings, and paragraphs. "
            "Return only the extracted text, nothing else."
        )

        try:
            response = model.generate_content([prompt, img])
            page_text = response.text.strip()
        except Exception as e:
            page_text = f"[Page {page_num + 1} OCR failed: {str(e)}]"

        full_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"

    doc.close()
    return full_text.strip()


def extract_text_from_image(image_path):
    """
    Extract text from an image file using Gemini Vision API.
    Supports JPG, JPEG, PNG, BMP, TIFF.
    """
    model = _configure_gemini()

    img = Image.open(image_path)

    prompt = (
        "You are an OCR engine. Extract ALL text from this image exactly as it appears. "
        "Preserve structure and layout as much as possible. "
        "Return only the extracted text, nothing else."
    )

    try:
        response = model.generate_content([prompt, img])
        return response.text.strip()
    except Exception as e:
        raise RuntimeError(f"Gemini OCR failed for image: {str(e)}")


def extract_text(file_path):
    """
    Main entry point — decides which extraction method to use
    based on the file type and content.
    """
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == '.pdf':
        if is_pdf_scanned(file_path):
            return extract_text_from_scanned_pdf(file_path)
        else:
            return extract_text_from_pdf(file_path)

    elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
        return extract_text_from_image(file_path)

    elif file_extension == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    else:
        return f"[Unsupported file type: {file_extension}]"