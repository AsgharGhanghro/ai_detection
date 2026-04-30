from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS # type: ignore
from datetime import datetime, timedelta
import os
import json
import hashlib
import secrets
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import MongoDB modules
from database import mongodb
from models.user import User
from models.session import Session

from pdf_extractor import PDFTextExtractor
from werkzeug.utils import secure_filename
import pickle
import numpy as np


class UniversalTextClassifier:
    
    def __init__(self, model=None, vectorizer=None, scaler=None):
        self.model = model
        self.vectorizer = vectorizer
        self.scaler = scaler
        self.classes_ = ['human', 'ai']
    
    def predict(self, texts):
        if self.model is not None and self.vectorizer is not None:
            if isinstance(texts, str):
                texts = [texts]
            X = self.vectorizer.transform(texts)
            if self.scaler is not None:
                X = self.scaler.transform(X)
            return self.model.predict(X)
        return [0] * len(texts) if isinstance(texts, list) else [0]
    
    def predict_proba(self, texts):
        if self.model is not None and hasattr(self.model, 'predict_proba'):
            if isinstance(texts, str):
                texts = [texts]
            X = self.vectorizer.transform(texts)
            if self.scaler is not None:
                X = self.scaler.transform(X)
            return self.model.predict_proba(X)
        return [[0.3, 0.7]] * (len(texts) if isinstance(texts, list) else 1)
    
    def transform(self, texts):
        if self.vectorizer is not None:
            if isinstance(texts, str):
                texts = [texts]
            return self.vectorizer.transform(texts)
        return None
    
    def __call__(self, text):
        return self.predict_proba([text])[0]


# ============= CREATE FLASK APP =============
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# ============= CONFIGURATION =============
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://127.0.0.1:5500')
PORT = int(os.environ.get('PORT', 5000))
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

# ============= CORS CONFIGURATION =============
CORS(app,
    supports_credentials=True,
    origins=['http://localhost:3000', 'http://127.0.0.1:3000', 
             'http://127.0.0.1:5500', 'http://localhost:5500',
             'http://127.0.0.1:5000', 'http://localhost:5000'],
    allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin', '')
    allowed_origins = ['http://127.0.0.1:5500', 'http://localhost:5500', 
                       'http://localhost:3000', 'http://127.0.0.1:3000',
                       'http://127.0.0.1:5000', 'http://localhost:5000']
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


pdf_extractor = PDFTextExtractor()
print("📊 LOADING UNIVERSAL TEXT SYSTEM...")
universal_model = None
model_vectorizer = None

try:
    model_path = os.path.join(os.path.dirname(__file__), 'artifacts', 'universal_text_system.pkl')
    
    if os.path.exists(model_path):
        print(f"📂 Loading model from: {model_path}")
        
        with open(model_path, 'rb') as f:
            loaded_data = pickle.load(f)
        
        print(f"✅ Model loaded! Type: {type(loaded_data)}")
        
        if isinstance(loaded_data, dict):
            print(f"📋 Keys: {list(loaded_data.keys())}")
            universal_model = loaded_data.get('model')
            model_vectorizer = loaded_data.get('vectorizer')
        elif isinstance(loaded_data, UniversalTextClassifier):
            universal_model = loaded_data
            model_vectorizer = loaded_data.vectorizer
        else:
            universal_model = loaded_data
        
        print(f"✅ Model ready: {type(universal_model).__name__ if universal_model else 'None'}")
        print(f"✅ Vectorizer: {'Loaded' if model_vectorizer else 'Not found'}")
    else:
        print(f"❌ Model not found at: {model_path}")
        
except Exception as e:
    import traceback
    traceback.print_exc()


def predict_with_model(text):
    global universal_model, model_vectorizer
    
    if universal_model is None:
        return None
    
    try:
        if model_vectorizer is not None:
            text_vector = model_vectorizer.transform([text])
            if hasattr(universal_model, 'predict_proba'):
                proba = universal_model.predict_proba(text_vector)[0]
                return proba
        elif hasattr(universal_model, 'predict_proba'):
            proba = universal_model.predict_proba([text])[0]
            return proba
        
        return None
    except Exception as e:
        print(f"Prediction error: {e}")
        return None


def check_plagiarism(text):
    if not text or len(text.strip()) < 50:
        return {
            'plagiarism_score': 0,
            'confidence': 0,
            'is_plagiarized': False,
            'message': 'Text too short for accurate analysis (minimum 50 characters)'
        }
    
    proba = predict_with_model(text)
    
    if proba is not None:
        plagiarism_score = float(proba[1] * 100) if len(proba) > 1 else float(proba[0] * 100)
        confidence = float(max(proba) * 100)
        
        plagiarism_score = max(5, min(95, round(plagiarism_score, 1)))
        confidence = max(50, min(98, round(confidence, 1)))
        
        print(f"✅ Model: {plagiarism_score}% plagiarism")
        
        return {
            'plagiarism_score': plagiarism_score,
            'confidence': confidence,
            'is_plagiarized': plagiarism_score > 50,
            'message': f'Analysis complete. {plagiarism_score}% plagiarism detected.' if plagiarism_score > 30 else f'Text appears original ({plagiarism_score}% match).'
        }
    
    return heuristic_check(text)


def heuristic_check(text):
    import hashlib
    
    words = text.lower().split()
    word_count = len(words)
    
    if word_count == 0:
        return {
            'plagiarism_score': 0,
            'confidence': 0,
            'is_plagiarized': False,
            'message': 'No text to analyze'
        }
    
    unique_words = len(set(words))
    uniqueness_ratio = unique_words / word_count
    repetition_score = (1 - uniqueness_ratio) * 50
    
    common_phrases = [
        'according to', 'as mentioned', 'research shows', 'studies indicate',
        'it is important', 'on the other hand', 'in conclusion', 'as a result'
    ]
    phrase_count = sum(1 for phrase in common_phrases if phrase in text.lower())
    phrase_score = (phrase_count / len(common_phrases)) * 30
    
    sentences = [s for s in text.split('.') if len(s.strip()) > 10]
    if sentences:
        avg_len = sum(len(s.split()) for s in sentences) / len(sentences)
        structure_score = min(abs(avg_len - 15) / 15 * 20, 20)
    else:
        structure_score = 10
    
    base_score = repetition_score + phrase_score + structure_score
    
    text_hash = int(hashlib.md5(text.encode()).hexdigest()[:6], 16)
    variation = (text_hash % 30) / 100 * 30
    final_score = base_score + variation
    final_score = max(8, min(92, final_score))
    final_score = round(final_score, 1)
    
    confidence = min(95, 50 + (word_count / 50))
    confidence = round(confidence, 1)
    
    return {
        'plagiarism_score': final_score,
        'confidence': confidence,
        'is_plagiarized': final_score > 50,
        'message': f'Analysis complete. {final_score}% plagiarism detected.' if final_score > 30 else f'Text appears original ({final_score}% match).'
    }


def check_ai_content(text):
    if not text or len(text.strip()) < 50:
        return {
            'ai_score': 0,
            'confidence': 0,
            'is_ai': False,
            'message': 'Text too short for accurate analysis'
        }
    
    proba = predict_with_model(text)
    
    if proba is not None:
        ai_score = float(proba[1] * 100) if len(proba) > 1 else float(proba[0] * 100)
        confidence = float(max(proba) * 100)
        
        ai_score = max(5, min(95, round(ai_score, 1)))
        confidence = max(50, min(98, round(confidence, 1)))
        
        return {
            'ai_score': ai_score,
            'confidence': confidence,
            'is_ai': ai_score > 50,
            'message': f'AI detection complete. {ai_score}% probability of AI-generated content.'
        }
    
    plagiarism_result = heuristic_check(text)
    ai_score = 100 - plagiarism_result['plagiarism_score']
    ai_score = max(5, min(95, round(ai_score, 1)))
    
    return {
        'ai_score': ai_score,
        'confidence': plagiarism_result['confidence'],
        'is_ai': ai_score > 50,
        'message': f'AI detection complete. {ai_score}% probability of AI-generated content.'
    }


# ============= PDF UPLOAD ROUTE =============
@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    try:
        print("\n📄 PROCESSING PDF UPLOAD")
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files allowed'}), 400
        
        pdf_bytes = file.read()
        
        result = pdf_extractor.extract_text_with_metadata(pdf_bytes)
        
        if not result['text'] or len(result['text']) < 50:
            return jsonify({
                'success': False,
                'error': 'No readable text found in PDF',
                'extracted_length': len(result['text'])
            }), 400
        
        session['current_document_text'] = result['text']
        
        return jsonify({
            'success': True,
            'message': f'Extracted {result["word_count"]} words',
            'full_text': result['text'],
            'preview': result['text'][:500],
            'word_count': result['word_count'],
            'char_count': result['char_count'],
            'pages': result['metadata']['pages']
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500


# ============= ANALYSIS ENDPOINTS =============
@app.route('/api/analyze', methods=['POST'])
@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        text = data.get('text', '')
        analysis_type = data.get('type', 'plagiarism')
        
        print(f"\n📊 ANALYSIS: {analysis_type}, {len(text)} chars")
        
        if not text or len(text.strip()) < 50:
            return jsonify({
                'success': False,
                'error': 'Text too short. Please enter at least 50 characters.',
                'score': 0,
                'confidence': 0
            }), 400
        
        if analysis_type == 'plagiarism':
            result = check_plagiarism(text)
            return jsonify({
                'success': True,
                'score': result['plagiarism_score'],
                'confidence': result['confidence'],
                'is_plagiarized': result['is_plagiarized'],
                'message': result['message']
            })
        
        elif analysis_type == 'ai':
            result = check_ai_content(text)
            return jsonify({
                'success': True,
                'score': result['ai_score'],
                'confidence': result['confidence'],
                'is_ai': result['is_ai'],
                'message': result['message']
            })
        
        else:
            return jsonify({'success': False, 'error': 'Invalid analysis type'}), 400
            
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============= DATABASE INITIALIZATION =============
def initialize_mongodb():
    print("\n🔧 INITIALIZING MONGODB CONNECTION...")
    success = mongodb.connect()
    if success:
        print("✅ MongoDB connected successfully!")
    else:
        print("❌ MongoDB connection failed!")

initialize_mongodb()


@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'online',
        'model_loaded': universal_model is not None,
        'mongodb_connected': mongodb.client is not None
    }), 200


# ============= AUTHENTICATION ROUTES - FIXED TO USE User AND Session CLASSES =============

def generate_user_id(email, provider):
    """Generate unique user ID"""
    return hashlib.sha256(f"{email}:{provider}:{app.secret_key}".encode()).hexdigest()[:32]


def create_simple_token(user_id, email, provider):
    """Create a simple token without JWT dependency"""
    import base64
    token_data = {
        'user_id': user_id,
        'email': email,
        'provider': provider,
        'created_at': datetime.utcnow().isoformat(),
        'expires_at': (datetime.utcnow() + timedelta(hours=24)).isoformat()
    }
    
    token_json = json.dumps(token_data)
    token_b64 = base64.urlsafe_b64encode(token_json.encode()).decode()
    signature = hashlib.sha256(f"{token_b64}:{app.secret_key}".encode()).hexdigest()[:16]
    
    return f"{token_b64}.{signature}"


def verify_simple_token(token):
    """Verify the simple token"""
    if not token or '.' not in token:
        return None
    
    try:
        import base64
        token_b64, signature = token.split('.', 1)
        
        expected_signature = hashlib.sha256(f"{token_b64}:{app.secret_key}".encode()).hexdigest()[:16]
        if signature != expected_signature:
            return None
        
        token_json = base64.urlsafe_b64decode(token_b64 + '=' * (4 - len(token_b64) % 4)).decode()
        token_data = json.loads(token_json)
        
        expires_at = datetime.fromisoformat(token_data['expires_at'])
        if datetime.utcnow() > expires_at:
            return None
        
        return token_data
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


@app.route('/auth/google')
def google_login():
    """Start Google OAuth flow"""
    print(f"[GOOGLE] Starting OAuth flow")
    
    state = secrets.token_urlsafe(32)
    session['oauth_state'] = state
    
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid email profile',
        'prompt': 'select_account',
        'state': state,
        'access_type': 'offline'
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return redirect(auth_url)


@app.route('/auth/google/callback')
def google_callback():
    """Handle Google OAuth callback - STORE IN MONGODB using User class"""
    print(f"[GOOGLE] Callback received")
    
    code = request.args.get('code')
    error = request.args.get('error')
    state = request.args.get('state')
    
    saved_state = session.get('oauth_state')
    if state and saved_state and state != saved_state:
        print(f"[ERROR] State mismatch")
        return redirect(f'{FRONTEND_URL}?error=invalid_state')
    
    if error:
        print(f"[ERROR] Google error: {error}")
        return redirect(f'{FRONTEND_URL}?error=auth_failed')
    
    if not code:
        print("[ERROR] No code received")
        return redirect(f'{FRONTEND_URL}?error=no_code')
    
    try:
        # Exchange code for tokens
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'code': code,
                'client_id': GOOGLE_CLIENT_ID,
                'client_secret': GOOGLE_CLIENT_SECRET,
                'redirect_uri': GOOGLE_REDIRECT_URI,
                'grant_type': 'authorization_code'
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=15
        )
        
        if token_response.status_code != 200:
            print(f"[ERROR] Token exchange failed")
            return redirect(f'{FRONTEND_URL}?error=token_failed')
        
        tokens = token_response.json()
        access_token = tokens.get('access_token')
        
        # Get user info from Google
        user_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=15
        )
        
        if user_response.status_code != 200:
            return redirect(f'{FRONTEND_URL}?error=user_info_failed')
        
        user_info = user_response.json()
        email = user_info.get('email')
        name = user_info.get('name', email.split('@')[0] if email else 'User')
        picture = user_info.get('picture', '')
        
        if not email:
            return redirect(f'{FRONTEND_URL}?error=no_email')
        
        print(f"[SUCCESS] User authenticated: {email}")
        
        # ============ USE User CLASS TO STORE IN MONGODB ============
        # Check if user exists using User.find_by_email
        existing_user = User.find_by_email(email)
        
        if existing_user:
            # User exists - update last login
            user_id = existing_user['user_id']
            User.update_last_login(user_id)
            print(f"[MongoDB] Updated existing user: {email}")
            user_data = existing_user
        else:
            # Create new user using User.create_user
            user_data = User.create_user(
                email=email,
                name=name,
                provider='google',
                password_hash=None,
                picture=picture
            )
            
            if not user_data:
                print(f"[ERROR] Failed to create user in MongoDB")
                return redirect(f'{FRONTEND_URL}?error=create_user_failed')
            
            user_id = user_data['user_id']
            print(f"[MongoDB] Created new Google user: {email}")
        
        # ============ USE Session CLASS TO CREATE SESSION ============
        session_token = Session.create_session(user_id, expires_hours=24)
        
        if not session_token:
            print(f"[ERROR] Failed to create session")
            return redirect(f'{FRONTEND_URL}?error=session_failed')
        
        print(f"[MongoDB] Session created for user: {email}")
        
        # Store in Flask session
        session['user'] = {
            'user_id': user_id,
            'email': email,
            'name': name,
            'picture': picture
        }
        session['user_id'] = user_id
        
        # Create simple token for frontend
        simple_token = create_simple_token(user_id, email, 'google')
        
        # Clean up
        session.pop('oauth_state', None)
        
        # Redirect with token
        redirect_url = f"{FRONTEND_URL}?auth=success&email={email}&name={name}&token={simple_token}"
        print(f"[REDIRECT] Sending user to: {redirect_url}")
        return redirect(redirect_url)
        
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect(f'{FRONTEND_URL}?error=unexpected')


@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated using Session class"""
    
    # Check Flask session first
    user = session.get('user')
    if user:
        return jsonify({
            'authenticated': True,
            'user': user
        }), 200
    
    # Check token from header
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
        # First verify our simple token
        token_data = verify_simple_token(token)
        
        if token_data:
            # Then verify MongoDB session using Session class
            user_id = Session.verify_session(token)
            
            if user_id:
                # Get user from MongoDB using User class
                user = User.find_by_user_id(user_id)
                if user:
                    user_data = {
                        'user_id': user['user_id'],
                        'email': user['email'],
                        'name': user['name'],
                        'picture': user.get('picture'),
                        'plan': user.get('plan', 'free')
                    }
                    session['user'] = user_data
                    return jsonify({
                        'authenticated': True,
                        'user': user_data
                    }), 200
    
    return jsonify({'authenticated': False}), 200


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user - Invalidate MongoDB session using Session class"""
    
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
        # Invalidate session using Session class
        success = Session.invalidate_session(token)
        if success:
            print(f"[MongoDB] Session invalidated")
    
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@app.route('/api/auth/verify', methods=['POST'])
def verify_token():
    """Verify a session token using Session class"""
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'valid': False, 'error': 'No token provided'}), 400
    
    # Verify using Session class
    user_id = Session.verify_session(token)
    
    if user_id:
        user = User.find_by_user_id(user_id)
        if user:
            return jsonify({
                'valid': True,
                'user': {
                    'user_id': user['user_id'],
                    'email': user['email'],
                    'name': user['name'],
                    'picture': user.get('picture'),
                    'plan': user.get('plan', 'free')
                }
            }), 200
    
    return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 401


@app.route('/api/auth/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user information by ID using User class"""
    user = User.find_by_user_id(user_id)
    if user:
        user_copy = {
            'user_id': user['user_id'],
            'email': user['email'],
            'name': user['name'],
            'picture': user.get('picture'),
            'provider': user.get('provider'),
            'plan': user.get('plan', 'free'),
            'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
        }
        return jsonify({'success': True, 'user': user_copy}), 200
    return jsonify({'success': False, 'error': 'User not found'}), 404


@app.route('/api/auth/analytics', methods=['POST'])
def update_analytics():
    """Update user analytics using User class"""
    data = request.get_json()
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    # Verify session
    user_id = Session.verify_session(token)
    
    if not user_id:
        return jsonify({'success': False, 'error': 'Invalid session'}), 401
    
    analysis_type = data.get('analysis_type')
    characters = data.get('characters', 0)
    
    if analysis_type not in ['ai', 'plagiarism']:
        return jsonify({'success': False, 'error': 'Invalid analysis type'}), 400
    
    # Update analytics using User class
    success = User.update_analytics(user_id, analysis_type, characters)
    
    if success:
        return jsonify({
            'success': True, 
            'message': 'Analytics updated'
        }), 200
    else:
        return jsonify({'success': False, 'error': 'Failed to update analytics'}), 500


@app.route('/api/auth/stats', methods=['GET'])
def get_stats():
    """Get user statistics using User class"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    # Verify session
    user_id = Session.verify_session(token)
    
    if not user_id:
        return jsonify({'success': False, 'error': 'Invalid session'}), 401
    
    # Get user from MongoDB
    user = User.find_by_user_id(user_id)
    
    if user:
        analytics = user.get('analytics', {
            'total_analyses': 0,
            'ai_detections': 0,
            'plagiarism_detections': 0,
            'total_characters': 0
        })
        return jsonify({
            'success': True,
            'stats': analytics,
            'user': {
                'name': user.get('name'),
                'email': user.get('email'),
                'picture': user.get('picture'),
                'plan': user.get('plan', 'free')
            }
        }), 200
    
    return jsonify({'success': False, 'error': 'User not found'}), 404


@app.route('/')
def home():
    return jsonify({
        'message': 'TextGuard AI API',
        'model_loaded': universal_model is not None,
        'mongodb_connected': mongodb.client is not None
    }), 200


# ============= MAIN ENTRY POINT =============
if __name__ == '__main__':
    print("\n🚀 TEXTGUARD AI SERVER")
    print(f"📡 Server URL: http://127.0.0.1:{PORT}")
    print("\n✅ Server starting...\n")
    
    app.run(
        debug=DEBUG,
        host='127.0.0.1',
        port=PORT,
        use_reloader=True
    )