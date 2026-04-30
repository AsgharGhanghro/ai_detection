import pickle
import os

def fix_model():
    """Re-save the model without custom class dependency"""
    
    model_path = os.path.join('artifacts', 'universal_text_system.pkl')
    
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}")
        return
    
    print(f"Loading model from {model_path}...")
    
    try:
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        print(f"Original model type: {type(model_data)}")
        
        # Extract the actual model components
        if hasattr(model_data, 'model'):
            # It's a custom class instance
            extracted = {
                'model': model_data.model,
                'vectorizer': getattr(model_data, 'vectorizer', None),
                'scaler': getattr(model_data, 'scaler', None),
                'classes': getattr(model_data, 'classes_', ['human', 'ai'])
            }
        elif isinstance(model_data, dict):
            extracted = model_data
        else:
            # Assume it's the model itself
            extracted = {
                'model': model_data,
                'vectorizer': None,
                'scaler': None
            }
        
        # Save as a simple dictionary
        new_path = os.path.join('artifacts', 'universal_text_system_fixed.pkl')
        with open(new_path, 'wb') as f:
            pickle.dump(extracted, f)
        
        print(f"✅ Fixed model saved to: {new_path}")
        print(f"   Keys: {list(extracted.keys())}")
        
        # Test loading
        with open(new_path, 'rb') as f:
            test_load = pickle.load(f)
        print(f"✅ Test load successful! Type: {type(test_load)}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_model()