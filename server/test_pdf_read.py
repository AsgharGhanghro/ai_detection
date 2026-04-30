import requests
import sys

def test_pdf_upload(pdf_path):
    """Test PDF upload and text extraction"""
    
    url = "http://127.0.0.1:5000/upload_pdf"
    
    with open(pdf_path, 'rb') as f:
        files = {'file': (pdf_path, f, 'application/pdf')}
        response = requests.post(url, files=files)
    
    result = response.json()
    
    print("\n" + "="*60)
    print("PDF UPLOAD TEST RESULT")
    print("="*60)
    
    if result.get('success'):
        print(f"✅ SUCCESS!")
        print(f"📊 Word count: {result.get('word_count')}")
        print(f"📝 Character count: {result.get('char_count')}")
        print(f"📄 Pages: {result.get('pages')}")
        print(f"\n📖 EXTRACTED TEXT PREVIEW:")
        print("-" * 60)
        print(result.get('preview', 'No preview'))
        print("-" * 60)
        
        # Save extracted text to file
        with open('extracted_text.txt', 'w', encoding='utf-8') as f:
            f.write(result.get('full_text', ''))
        print(f"\n💾 Full text saved to: extracted_text.txt")
        
    else:
        print(f"❌ FAILED: {result.get('error')}")
        if 'debug_info' in result:
            print(f"Debug: {result['debug_info']}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_pdf_upload(sys.argv[1])
    else:
        print("Usage: python test_pdf_read.py <path_to_pdf>")