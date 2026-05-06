import fitz  # PyMuPDF

from PIL import Image
import io
import os
from django.conf import settings

# Initialize EasyOCR reader once (lazy loading)
_reader = None

def get_reader():
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(['en', 'hi'])  # English + Hindi
    return _reader


def is_pdf_scanned(pdf_path):
    """Check if PDF has extractable text"""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text = page.get_text()
            if text.strip():
                return False  # Has text = digital PDF
        return True  # No text = scanned PDF
    except:
        return True


def extract_text_from_pdf(pdf_path):
    """Extract text from digital PDF using PyMuPDF"""
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def extract_text_from_scanned_pdf(pdf_path):
    """Extract text from scanned PDF using EasyOCR"""
    text = ""
    doc = fitz.open(pdf_path)
    reader = get_reader()
    
    for page_num, page in enumerate(doc):
        # Convert PDF page to image
        pix = page.get_pixmap(dpi=150)
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        
        # OCR the image
        result = reader.readtext(img, detail=0)
        text += " ".join(result) + "\n"
    
    doc.close()
    return text


def extract_text_from_image(image_path):
    """Extract text from image file using EasyOCR"""
    reader = get_reader()
    result = reader.readtext(image_path, detail=0)
    return " ".join(result)


def extract_text(file_path):
    """Main function - decides which extraction method to use"""
    
    file_extension = os.path.splitext(file_path)[1].lower()
    
    # Handle PDF files
    if file_extension == '.pdf':
        if is_pdf_scanned(file_path):
            return extract_text_from_scanned_pdf(file_path)
        else:
            return extract_text_from_pdf(file_path)
    
    # Handle image files
    elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
        return extract_text_from_image(file_path)
    
    # Handle text files directly
    elif file_extension == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    else:
        return f"[Unsupported file type: {file_extension}]"