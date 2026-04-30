import os, pickle, numpy as np

class UniversalTextClassifier:
    def __init__(self, model=None, vectorizer=None, scaler=None):
        self.model = model
        self.vectorizer = vectorizer
        self.scaler = scaler
        self.classes_ = ['human', 'ai']
    def predict(self, texts):
        if self.model and self.vectorizer:
            if isinstance(texts, str): texts = [texts]
            X = self.vectorizer.transform(texts)
            if self.scaler: X = self.scaler.transform(X)
            return self.model.predict(X)
        return [0]
    def predict_proba(self, texts):
        if self.model and hasattr(self.model, 'predict_proba'):
            if isinstance(texts, str): texts = [texts]
            X = self.vectorizer.transform(texts)
            if self.scaler: X = self.scaler.transform(X)
            return self.model.predict_proba(X)
        return [[0.3, 0.7]]

class UniversalTextEncoder:
    def __init__(self, vectorizer=None, scaler=None):
        self.vectorizer = vectorizer
        self.scaler = scaler
    def transform(self, texts):
        if isinstance(texts, str): texts = [texts]
        X = self.vectorizer.transform(texts)
        if self.scaler: X = self.scaler.transform(X)
        return X
    def fit(self, texts):
        self.vectorizer.fit(texts)
        return self
    def fit_transform(self, texts):
        return self.vectorizer.fit_transform(texts)

path = os.path.join('artifacts', 'universal_text_system.pkl')
print(f"Size   : {os.path.getsize(path) / 1e6:.2f} MB")

data = pickle.load(open(path, 'rb'))
print(f"Loaded : YES")
print(f"Type   : {type(data).__name__}")

if isinstance(data, dict):
    print(f"Keys   : {list(data.keys())}")
    for k, v in data.items():
        print(f"  {k}  ->  {type(v).__name__}")
        if hasattr(v, 'classes_'):      print(f"    classes_   : {list(v.classes_)}")
        if hasattr(v, 'n_features_in_'): print(f"    n_features : {v.n_features_in_}")
        if hasattr(v, 'vocabulary_'):   print(f"    vocab_size : {len(v.vocabulary_)}")
        if hasattr(v, 'vectorizer') and v.vectorizer:
            print(f"    vectorizer : {type(v.vectorizer).__name__}")
elif hasattr(data, 'model'):
    print(f"  inner model : {type(data.model).__name__}")
    print(f"  vectorizer  : {type(data.vectorizer).__name__ if data.vectorizer else 'None'}")

print("\n--- PREDICTION TEST ---")
human = "I went to the market yesterday and it was really nice!"
ai    = "Furthermore, the implementation of machine learning algorithms has consequently led to significant improvements."

try:
    if isinstance(data, dict):
        model = data.get('model') or data.get('classifier') or data.get('clf')
        vec   = data.get('vectorizer') or data.get('tfidf') or data.get('vec')
    else:
        model = data
        vec   = getattr(data, 'vectorizer', None)

    for label, text in [("HUMAN", human), ("AI", ai)]:
        X = vec.transform([text]) if vec else [text]
        p = model.predict_proba(X)[0]
        print(f"  {label}: {[round(float(x)*100,1) for x in p]}")
except Exception as e:
    print(f"  Test error: {e}")