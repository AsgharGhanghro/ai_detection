import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import logging
from difflib import SequenceMatcher
import csv
import time

logger = logging.getLogger(__name__)

from pdf_extractor import PDFTextExtractor

class PlagiarismChecker:
    def __init__(self):
        self.pdf_extractor = PDFTextExtractor()
    
    def check_document(self, file_bytes, filename):
        """Handle different file types"""
        if filename.endswith('.pdf'):
            text, used_ocr = self.pdf_extractor.extract_text(file_bytes)
            if not text:
                raise ValueError("Could not extract text from PDF")
            return self.check_text(text)
        elif filename.endswith('.txt'):
            text = file_bytes.decode('utf-8')
            return self.check_text(text)
        else:
            raise ValueError(f"Unsupported file type: {filename}")
        
class PlagiarismChecker:
    def __init__(self, dataset_paths):
        self.datasets = []
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 3), max_features=5000, stop_words='english')
        self.is_loaded = False
        self.reference_texts = []
        
        # Load datasets
        for path in dataset_paths:
            try:
                texts = self.load_csv_texts(path)
                self.datasets.extend(texts)
                logger.info(f"Loaded dataset: {path} with {len(texts)} texts")
            except Exception as e:
                logger.warning(f"Failed to load dataset {path}: {str(e)}")
    
    def load_csv_texts(self, filepath):
        """Load texts from CSV with better sampling"""
        texts = []
        max_texts = 10000  # Increased for better coverage
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                reader = csv.DictReader(file)
                for i, row in enumerate(reader):
                    if i >= max_texts:
                        break
                    # Try to extract text from multiple columns
                    for key, value in row.items():
                        if value and len(str(value).strip()) > 50:  # Increased minimum length
                            clean_text = self.clean_text(str(value).strip())
                            if len(clean_text) > 50:
                                texts.append(clean_text)
                                break
        except Exception as e:
            logger.error(f"Error reading CSV {filepath}: {str(e)}")
            # Fallback: try reading as simple text file
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                    lines = file.readlines()
                    for line in lines[:max_texts]:
                        clean_line = self.clean_text(line.strip())
                        if len(clean_line) > 50:
                            texts.append(clean_line)
            except:
                pass
                
        return texts
    
    def clean_text(self, text):
        """Clean and normalize text"""
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s.,!?;:]', '', text)
        return text.strip()
    
    def load_plagiarism_data(self):
        """Load and prepare plagiarism data with better sampling"""
        try:
            # Combine all texts and remove duplicates
            all_texts = list(set([text for text in self.datasets if len(text.strip()) > 50]))
            
            # Use larger sample for better detection
            sample_size = min(20000, len(all_texts))
            self.reference_texts = all_texts[:sample_size]
            
            if len(self.reference_texts) > 0:
                logger.info(f"Training vectorizer with {len(self.reference_texts)} texts...")
                self.vectorizer.fit(self.reference_texts)
                self.is_loaded = True
                logger.info(f"✅ Plagiarism checker loaded with {len(self.reference_texts)} reference texts")
                return True
            else:
                logger.warning("No valid reference texts found")
                return False
                
        except Exception as e:
            logger.error(f"Error loading plagiarism data: {str(e)}")
            return False
    
    def check_plagiarism(self, text, threshold=0.7):
        """Enhanced plagiarism check with better matching"""
        if not self.is_loaded:
            return self.fallback_plagiarism_check(text)
        
        start_time = time.time()
        
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            # Check overall similarity and get detailed matches
            overall_similarity, best_match, detailed_matches = self.find_detailed_matches(text)
            
            matches = []
            if overall_similarity > threshold:
                matches.append({
                    'text': text[:150] + "..." if len(text) > 150 else text,
                    'similarity': overall_similarity,
                    'match_text': best_match['text'][:150] + "..." if len(best_match['text']) > 150 else best_match['text'],
                    'source': 'reference_dataset'
                })
            
            # Add detailed matches
            matches.extend(detailed_matches)
            
            processing_time = time.time() - start_time
            logger.info(f"Plagiarism check completed in {processing_time:.2f}s - Similarity: {overall_similarity:.3f}")
            
            return {
                'similarity': float(overall_similarity),
                'matches': matches[:10],  # Increased limit
                'total_matches': len(matches),
                'threshold_used': threshold,
                'processing_time': processing_time
            }
            
        except Exception as e:
            logger.error(f"Error in plagiarism check: {str(e)}")
            return self.fallback_plagiarism_check(text)
    
    def find_detailed_matches(self, text):
        """Find detailed matches with n-gram analysis"""
        try:
            # Vectorize input text
            text_vector = self.vectorizer.transform([text])
            
            # Use larger sample for better detection
            sample_size = min(5000, len(self.reference_texts))
            sample_texts = self.reference_texts[:sample_size]
            
            best_similarity = 0
            best_match = {"text": "", "source": "reference_dataset"}
            detailed_matches = []
            
            # Batch process for better performance
            ref_vectors = self.vectorizer.transform(sample_texts)
            similarities = cosine_similarity(text_vector, ref_vectors)
            
            # Find best match
            best_idx = np.argmax(similarities)
            best_similarity = similarities[0][best_idx]
            best_match["text"] = sample_texts[best_idx]
            
            # Find additional matches above threshold
            threshold = 0.6
            for i, similarity in enumerate(similarities[0]):
                if similarity > threshold and i != best_idx:
                    detailed_matches.append({
                        'text': text[:100] + "..." if len(text) > 100 else text,
                        'similarity': float(similarity),
                        'match_text': sample_texts[i][:100] + "..." if len(sample_texts[i]) > 100 else sample_texts[i],
                        'source': 'reference_dataset'
                    })
            
            return float(best_similarity), best_match, detailed_matches[:5]
            
        except Exception as e:
            logger.error(f"Error in detailed matching: {str(e)}")
            return self.sequence_based_similarity(text)
    
    def sequence_based_similarity(self, text):
        """Enhanced sequence matching"""
        best_similarity = 0
        best_match = {"text": "", "source": "reference_dataset"}
        detailed_matches = []
        
        # Use larger sample for better coverage
        sample_size = min(1000, len(self.reference_texts))
        
        for ref_text in self.reference_texts[:sample_size]:
            # Compare longer segments for better accuracy
            similarity = SequenceMatcher(None, text.lower()[:500], ref_text.lower()[:500]).ratio()
            if similarity > best_similarity:
                best_similarity = similarity
                best_match["text"] = ref_text
            
            # Collect additional matches
            if similarity > 0.7:
                detailed_matches.append({
                    'text': text[:100] + "..." if len(text) > 100 else text,
                    'similarity': float(similarity),
                    'match_text': ref_text[:100] + "..." if len(ref_text) > 100 else ref_text,
                    'source': 'reference_dataset'
                })
        
        return float(best_similarity), best_match, detailed_matches[:3]
    
    def fallback_plagiarism_check(self, text):
        """Enhanced fallback plagiarism check"""
        common_phrases = [
            "artificial intelligence", "machine learning", "deep learning", 
            "neural network", "big data", "cloud computing", "data analysis",
            "natural language processing", "computer vision", "algorithm",
            "the internet of things", "blockchain technology", "cybersecurity"
        ]
        
        text_lower = text.lower()
        matches = []
        
        for phrase in common_phrases:
            if phrase in text_lower:
                matches.append({
                    'text': phrase,
                    'similarity': 0.8,
                    'match_text': phrase,
                    'source': 'common_phrase'
                })
        
        # Calculate basic similarity based on common phrases
        phrase_count = len([p for p in common_phrases if p in text_lower])
        overall_similarity = min(phrase_count * 0.1, 0.8)
        
        return {
            'similarity': float(overall_similarity),
            'matches': matches,
            'total_matches': len(matches),
            'threshold_used': 0.7,
            'fallback_used': True
        }
    
    def split_into_sentences(self, text):
        """Split text into sentences"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if len(s.strip()) > 0]
    
    def preprocess_text(self, text):
        """Preprocess text for plagiarism check"""
        text = str(text).lower()
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text