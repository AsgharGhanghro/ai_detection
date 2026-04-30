# fix_model_loading.py - Fix the pickle loading issue
import pickle
import sys
import os

# Add the current directory to path so it can find the class
sys.path.append(os.path.dirname(__file__))

# Import the UniversalTextClassifier class from your app
from app import UniversalTextClassifier

print("=" * 60)
print("FIXING MODEL LOADING")
print("=" * 60)

model_path = 'artifacts/universal_text_system.pkl'

print(f"\n1. Loading model with proper class definition...")
try:
    with open(model_path, 'rb') as f:
        model_data = pickle.load(f)
    print(f"   ✅ Model loaded successfully!")
    print(f"   Type: {type(model_data)}")
    
    # Check what's inside
    if isinstance(model_data, dict):
        print(f"   Keys: {list(model_data.keys())}")
        
        # Extract components
        model = model_data.get('model')
        vectorizer = model_data.get('vectorizer')
        scaler = model_data.get('scaler')
        
        print(f"\n2. Extracted components:")
        print(f"   Model: {type(model).__name__ if model else 'None'}")
        print(f"   Vectorizer: {type(vectorizer).__name__ if vectorizer else 'None'}")
        print(f"   Scaler: {type(scaler).__name__ if scaler else 'None'}")
        
        # Save in simpler format
        print(f"\n3. Saving in simpler format...")
        simple_model_data = {
            'model': model,
            'vectorizer': vectorizer,
            'scaler': scaler,
            'classes': ['human', 'ai']
        }
        
        new_model_path = 'artifacts/universal_text_system_fixed.pkl'
        with open(new_model_path, 'wb') as f:
            pickle.dump(simple_model_data, f)
        print(f"   ✅ Saved to: {new_model_path}")
        print(f"   Size: {os.path.getsize(new_model_path) / (1024*1024):.2f} MB")
        
    elif hasattr(model_data, 'predict_proba'):
        print(f"   Model has predict_proba: ✅")
        print(f"   Model type: {type(model_data)}")
        
        # Save as dict for easier loading
        simple_model_data = {
            'model': model_data,
            'vectorizer': None,
            'scaler': None,
            'classes': ['human', 'ai']
        }
        
        new_model_path = 'artifacts/universal_text_system_fixed.pkl'
        with open(new_model_path, 'wb') as f:
            pickle.dump(simple_model_data, f)
        print(f"   ✅ Saved simplified model to: {new_model_path}")
    
except Exception as e:
    print(f"   ❌ Failed to load: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Done! Now update your app.py to use the new model file.")