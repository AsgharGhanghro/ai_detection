from pdf_extractor import PDFTextExtractor

# Test with a PDF file
with open('test.pdf', 'rb') as f:
    pdf_bytes = f.read()

extractor = PDFTextExtractor()
text, used_ocr = extractor.extract_text(pdf_bytes)

print(f"Extracted {len(text)} characters")
print(f"Used OCR: {used_ocr}")
print(f"Preview: {text[:500]}")