import pdfplumber # type: ignore
import io
import re
from typing import Tuple, Dict, Any

class PDFTextExtractor:
    def __init__(self):
        print("📄 PDF Text Extractor Ready (using pdfplumber)")
    
    def extract_text_with_metadata(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract readable text from PDF using pdfplumber
        Returns NORMAL TEXT, not binary!
        """
        result = {
            'text': '',
            'used_ocr': False,
            'metadata': {
                'title': '',
                'author': '',
                'pages': 0
            },
            'word_count': 0,
            'char_count': 0
        }
        
        try:
            # Open PDF with pdfplumber
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                
                # Get number of pages
                result['metadata']['pages'] = len(pdf.pages)
                
                # Extract text from all pages
                all_text = []
                
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract text - this returns STRING, not binary!
                    page_text = page.extract_text()
                    
                    if page_text and page_text.strip():
                        # Clean the page text
                        page_text = self._clean_text(page_text)
                        all_text.append(page_text)
                        print(f"✅ Page {page_num}: {len(page_text)} characters extracted")
                        # Show preview
                        preview = page_text[:100].replace('\n', ' ')
                        print(f"   Preview: {preview}...")
                    else:
                        print(f"⚠️ Page {page_num}: No text found")
                        
                    # Also try extracting tables if needed
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            for row in table:
                                if row:
                                    table_text = ' '.join([str(cell) for cell in row if cell])
                                    if table_text:
                                        all_text.append(table_text)
                                        print(f"   Found table data: {table_text[:100]}")
                
                # Combine all text
                full_text = '\n\n'.join(all_text)
                
                # Final cleanup
                full_text = self._final_cleanup(full_text)
                
                result['text'] = full_text
                result['char_count'] = len(full_text)
                result['word_count'] = len(full_text.split())
                
                print(f"\n📊 EXTRACTION SUMMARY:")
                print(f"   Total characters: {result['char_count']}")
                print(f"   Total words: {result['word_count']}")
                print(f"   Total pages: {result['metadata']['pages']}")
                
                if result['char_count'] > 0:
                    print(f"\n📝 FIRST 200 CHARACTERS OF TEXT:")
                    print("-" * 50)
                    print(result['text'][:200])
                    print("-" * 50)
                
        except Exception as e:
            print(f"❌ PDF extraction failed: {e}")
            import traceback
            traceback.print_exc()
            result['text'] = ""
        
        return result
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        if not text:
            return ""
        
        # Remove extra spaces
        text = re.sub(r' +', ' ', text)
        
        # Fix line breaks
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()
    
    def _final_cleanup(self, text: str) -> str:
        """Final cleanup of text"""
        if not text:
            return ""
        
        # Remove any binary artifacts if present
        text = re.sub(r'[^\x20-\x7E\n\r\t\.\,\!\?\-\(\)\"\'\:\;]+', ' ', text)
        
        # Normalize spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Fix punctuation spacing
        text = re.sub(r'\s+([\.\,\!\?\-\(\)\"\'\:\;])', r'\1', text)
        
        return text.strip()
    
    def extract_text(self, pdf_bytes: bytes) -> Tuple[str, bool]:
        """Simple extract method"""
        result = self.extract_text_with_metadata(pdf_bytes)
        return result['text'], result['used_ocr']