import pickle
import os

def inspect_model():
    """Inspect what's inside the pickle file"""
    
    model_path = os.path.join('artifacts', 'universal_text_system.pkl')
    
    print(f"🔍 Inspecting model at: {model_path}")
    print(f"📂 File exists: {os.path.exists(model_path)}")
    
    if not os.path.exists(model_path):
        print("❌ Model file not found!")
        return
    
    print(f"📏 File size: {os.path.getsize(model_path)} bytes")
    
    try:
        with open(model_path, 'rb') as f:
            data = pickle.load(f)
        
        print(f"\n✅ Model loaded successfully!")
        print(f"📊 Type: {type(data)}")
        
        if isinstance(data, dict):
            print(f"📋 Keys: {list(data.keys())}")
            for key, value in data.items():
                print(f"   - {key}: {type(value)}")
        elif hasattr(data, '__dict__'):
            print(f"📋 Attributes: {dir(data)[:20]}...")
            print(f"📋 Class name: {data.__class__.__name__}")
        else:
            print(f"📋 Data: {str(data)[:200]}")
            
    except Exception as e:
        print(f"❌ Error loading: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    inspect_model()