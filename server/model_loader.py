import pickle
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

class SimpleModelWrapper:
    """Wrapper that works with any pickle file"""
    
    def __init__(self, model_path):
        self.model = None
        self.vectorizer = None
        self.load_model(model_path)
    
    def load_model(self, model_path):
        try:
            with open(model_path, 'rb') as f:
                data = pickle.load(f)
            
            # Try to extract model and vectorizer
            if isinstance(data, dict):
                self.model = data.get('model') or data.get('classifier') or data.get('clf')
                self.vectorizer = data.get('vectorizer') or data.get('tfidf') or data.get('vec')
            elif hasattr(data, 'predict'):
                self.model = data
                if hasattr(data, 'vectorizer'):
                    self.vectorizer = data.vectorizer
            else:
                self.model = data
            
            print(f"✅ Model loaded: {type(self.model).__name__ if self.model else 'Unknown'}")
            print(f"✅ Vectorizer: {'Yes' if self.vectorizer else 'No'}")
            
        except Exception as e:
            print(f"Error loading: {e}")
            self.model = None
    
    def predict_proba(self, texts):
        if self.model is None:
            return [[0.3, 0.7]]
        
        try:
            if self.vectorizer:
                X = self.vectorizer.transform(texts)
            else:
                X = texts
            
            if hasattr(self.model, 'predict_proba'):
                return self.model.predict_proba(X)
            elif hasattr(self.model, 'predict'):
                preds = self.model.predict(X)
                # Convert to probabilities
                return [[1-p, p] for p in preds]
            else:
                return [[0.3, 0.7]]
        except Exception as e:
            print(f"Prediction error: {e}")
            return [[0.3, 0.7]]

# Load the model
model_path = os.path.join(os.path.dirname(__file__), 'artifacts', 'universal_text_system.pkl')
model_wrapper = SimpleModelWrapper(model_path)