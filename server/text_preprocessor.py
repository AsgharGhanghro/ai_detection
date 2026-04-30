"""
Advanced Text Processing Module
Handles text preprocessing, cleaning, and feature extraction
"""
import re
import nltk # type: ignore
import string
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Download required NLTK data (with error handling)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    try:
        nltk.download('punkt', quiet=True)
    except:
        pass

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    try:
        nltk.download('stopwords', quiet=True)
    except:
        pass

try:
    from nltk.tokenize import sent_tokenize, word_tokenize # type: ignore
    from nltk.corpus import stopwords # type: ignore
    from nltk.stem import PorterStemmer # type: ignore
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    # Fallback implementations
    def sent_tokenize(text):
        return text.split('.')
    
    def word_tokenize(text):
        return text.split()
    
    class MockStopwords:
        def __init__(self):
            self.words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
        
        def __contains__(self, word):
            return word.lower() in self.words
    
    stopwords = MockStopwords()
    
    class PorterStemmer:
        def stem(self, word):
            return word

class TextProcessor:
    def __init__(self):
        self.stemmer = PorterStemmer()
        self.stop_words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among']) if not NLTK_AVAILABLE else set(stopwords.words('english'))
        
        # Common patterns for cleaning
        self.url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.number_pattern = re.compile(r'\d+')
        self.special_chars_pattern = re.compile(r'[^a-zA-Z\s]')
        
    def preprocess(self, text: str) -> str:
        """
        Complete text preprocessing pipeline
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Store original length
        original_length = len(text)
        
        # Step 1: Clean text
        text = self.clean_text(text)
        
        # Step 2: Normalize
        text = self.normalize_text(text)
        
        # Step 3: Remove noise
        text = self.remove_noise(text)
        
        # Step 4: Tokenize and clean
        text = self.tokenize_and_clean(text)
        
        logger.info(f"Text preprocessing: {original_length} -> {len(text)} characters")
        
        return text
    
    def clean_text(self, text: str) -> str:
        """Basic text cleaning"""
        # Remove URLs
        text = self.url_pattern.sub('', text)
        
        # Remove emails
        text = self.email_pattern.sub('', text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def normalize_text(self, text: str) -> str:
        """Text normalization"""
        # Convert to lowercase
        text = text.lower()
        
        # Handle contractions
        contractions = {
            "won't": "will not",
            "can't": "cannot",
            "n't": " not",
            "'re": " are",
            "'ve": " have",
            "'ll": " will",
            "'d": " would",
            "'m": " am"
        }
        
        for contraction, expansion in contractions.items():
            text = text.replace(contraction, expansion)
        
        return text
    
    def remove_noise(self, text: str) -> str:
        """Remove noise from text"""
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.!?]', '', text)
        
        # Remove extra punctuation
        text = re.sub(r'[.]{2,}', '.', text)
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        
        return text
    
    def tokenize_and_clean(self, text: str) -> str:
        """Tokenize and clean text"""
        # Tokenize into sentences
        sentences = sent_tokenize(text)
        
        cleaned_sentences = []
        for sentence in sentences:
            # Tokenize into words
            words = word_tokenize(sentence)
            
            # Remove stopwords and short words
            words = [word for word in words if word not in self.stop_words and len(word) > 2]
            
            # Stem words
            words = [self.stemmer.stem(word) for word in words]
            
            # Reconstruct sentence
            cleaned_sentence = ' '.join(words)
            cleaned_sentences.append(cleaned_sentence)
        
        return ' '.join(cleaned_sentences)
    
    def extract_features(self, text: str) -> Dict[str, Any]:
        """Extract various text features"""
        features = {}
        
        # Basic statistics
        words = word_tokenize(text)
        sentences = sent_tokenize(text)
        
        features['word_count'] = len(words)
        features['sentence_count'] = len(sentences)
        features['char_count'] = len(text)
        features['avg_word_length'] = np.mean([len(word) for word in words]) if words else 0 # type: ignore
        features['avg_sentence_length'] = np.mean([len(sent.sent.split()) for sent in sentences]) if sentences else 0 # type: ignore
        
        # Lexical diversity
        unique_words = set(words)
        features['lexical_diversity'] = len(unique_words) / len(words) if words else 0
        
        # Punctuation analysis
        punctuation = [char for char in text if char in string.punctuation]
        features['punctuation_ratio'] = len(punctuation) / len(text) if text else 0
        
        # Capitalization patterns
        capital_letters = [char for char in text if char.isupper()]
        features['capital_ratio'] = len(capital_letters) / len(text) if text else 0
        
        # Sentence complexity
        complex_sentences = [sent for sent in sentences if len(sent.split()) > 20]
        features['complex_sentence_ratio'] = len(complex_sentences) / len(sentences) if sentences else 0
        
        return features
    
    def extract_ngrams(self, text: str, n: int = 2) -> List[str]:
        """Extract n-grams from text"""
        words = word_tokenize(text.lower())
        words = [word for word in words if word.isalnum() and word not in self.stop_words]
        
        ngrams = []
        for i in range(len(words) - n + 1):
            ngram = ' '.join(words[i:i+n])
            ngrams.append(ngram)
        
        return ngrams
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        # Simple Jaccard similarity based on word overlap
        words1 = set(word_tokenize(text1.lower()))
        words2 = set(word_tokenize(text2.lower()))
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return 0.0
        
        jaccard_similarity = len(intersection) / len(union)
        
        return jaccard_similarity
    
    def detect_language(self, text: str) -> str:
        """Detect the language of the text"""
        # Simple heuristic based on character frequencies
        ascii_chars = len([c for c in text if ord(c) < 128])
        total_chars = len(text)
        
        if total_chars == 0:
            return 'unknown'
        
        ascii_ratio = ascii_chars / total_chars
        
        if ascii_ratio > 0.9:
            return 'english'
        else:
            return 'non_english'
    
    def remove_duplicates(self, texts: List[str]) -> List[str]:
        """Remove duplicate texts"""
        unique_texts = []
        seen = set()
        
        for text in texts:
            # Create a fingerprint (simple hash of cleaned text)
            cleaned = self.preprocess(text)
            fingerprint = hash(cleaned)
            
            if fingerprint not in seen:
                seen.add(fingerprint)
                unique_texts.append(text)
        
        return unique_texts
    
    def split_into_chunks(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks"""
        words = text.split()
        chunks = []
        
        if len(words) <= chunk_size:
            return [text]
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i:i + chunk_size]
            chunk = ' '.join(chunk_words)
            chunks.append(chunk)
        
        return chunks
    
    def get_text_statistics(self, text: str) -> Dict[str, Any]:
        """Get comprehensive text statistics"""
        stats = self.extract_features(text)
        
        # Additional statistics
        lines = text.split('\n')
        paragraphs = [p for p in text.split('\n\n') if p.strip()]
        
        stats['line_count'] = len(lines)
        stats['paragraph_count'] = len(paragraphs)
        stats['whitespace_ratio'] = len(re.findall(r'\s', text)) / len(text) if text else 0
        
        # Readability scores (simplified)
        stats['flesch_reading_ease'] = self._calculate_flesch_reading_ease(text)
        stats['flesch_kincaid_grade'] = self._calculate_flesch_kincaid_grade(text)
        
        return stats
    
    def _calculate_flesch_reading_ease(self, text: str) -> float:
        """Calculate Flesch Reading Ease score"""
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        if not sentences or not words:
            return 0.0
        
        avg_sentence_length = len(words) / len(sentences)
        syllables = self._count_syllables(words)
        avg_syllables_per_word = syllables / len(words)
        
        # Flesch Reading Ease formula
        score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        
        return max(0, min(100, score))
    
    def _calculate_flesch_kincaid_grade(self, text: str) -> float:
        """Calculate Flesch-Kincaid Grade Level"""
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        if not sentences or not words:
            return 0.0
        
        avg_sentence_length = len(words) / len(sentences)
        syllables = self._count_syllables(words)
        avg_syllables_per_word = syllables / len(words)
        
        # Flesch-Kincaid Grade formula
        grade = (0.39 * avg_sentence_length) + (11.8 * avg_syllables_per_word) - 15.59
        
        return max(0, grade)
    
    def _count_syllables(self, words: List[str]) -> int:
        """Count syllables in words (simplified)"""
        syllable_count = 0
        
        for word in words:
            word = word.lower()
            vowels = "aeiouy"
            syllables = 0
            prev_was_vowel = False
            
            for char in word:
                if char in vowels:
                    if not prev_was_vowel:
                        syllables += 1
                    prev_was_vowel = True
                else:
                    prev_was_vowel = False
            
            # Handle silent e
            if word.endswith('e') and syllables > 1:
                syllables -= 1
            
            # Ensure at least 1 syllable per word
            syllables = max(1, syllables)
            syllable_count += syllables
        
        return syllable_count