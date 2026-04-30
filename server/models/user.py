from datetime import datetime
import bcrypt # type: ignore
import hashlib
import secrets
from database import mongodb
import logging

logger = logging.getLogger(__name__)

class User:
    @staticmethod
    def get_collection():

        try:
            return mongodb.get_users_collection()
        except Exception as e:
            logger.error(f"Failed to get users collection: {e}")
            return None
    
    @staticmethod
    def create_user(email, name, provider='email', password_hash=None, picture=None):
        try:
            collection = User.get_collection()
            if collection is None:
                raise Exception("Users collection is unavailable")
            
            user_id = hashlib.sha256(f"{email}:{provider}:{secrets.token_hex(8)}".encode()).hexdigest()[:32]
            
            user_data = {
                'user_id': user_id,
                'email': email.lower(),
                'name': name,
                'provider': provider,
                'picture': picture,
                'created_at': datetime.utcnow(),
                'last_login': datetime.utcnow(),
                'is_active': True,
                'plan': 'free',
                'analytics': {
                    'total_analyses': 0,
                    'total_characters': 0,
                    'ai_detections': 0,
                    'plagiarism_detections': 0
                }
            }
            
            if password_hash:
                user_data['password_hash'] = password_hash
            
            result = collection.insert_one(user_data)
            user_data['_id'] = str(result.inserted_id)
            
            return user_data
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    @staticmethod
    def find_by_email(email):
        try:
            collection = User.get_collection()
            if collection is None: return None
            
            user = collection.find_one({'email': email.lower()})
            if user:
                user['_id'] = str(user['_id'])
            return user
        except Exception as e:
            logger.error(f"Error finding user: {e}")
            return None
    
    @staticmethod
    def find_by_user_id(user_id):
        try:
            collection = User.get_collection()
            if collection is None: return None
            
            user = collection.find_one({'user_id': user_id})
            if user:
                user['_id'] = str(user['_id'])
            return user
        except Exception as e:
            logger.error(f"Error finding user by id: {e}")
            return None
    
    @staticmethod
    def update_last_login(user_id):
        try:
            collection = User.get_collection()
            if collection is None: return False
            
            collection.update_one(
                {'user_id': user_id},
                {'$set': {'last_login': datetime.utcnow()}}
            )
            return True
        except Exception as e:
            logger.error(f"Error updating last login: {e}")
            return False
    
    @staticmethod
    def update_analytics(user_id, analysis_type, characters):
        try:
            collection = User.get_collection()
            if collection is None: return False
            
            update_fields = {
                f'analytics.{analysis_type}_detections': 1,
                'analytics.total_analyses': 1,
                'analytics.total_characters': characters
            }
            
            collection.update_one(
                {'user_id': user_id},
                {'$inc': update_fields}
            )
            return True
        except Exception as e:
            logger.error(f"Error updating analytics: {e}")
            return False
    
    @staticmethod
    def hash_password(password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password, password_hash):
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))