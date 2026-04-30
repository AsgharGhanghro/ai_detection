from datetime import datetime, timedelta
import hashlib
import secrets
from database import mongodb
import logging

logger = logging.getLogger(__name__)

class Session:
    @staticmethod
    def get_collection():

        try:
            return mongodb.get_sessions_collection()
        except Exception as e:
            logger.error(f"Failed to get sessions collection: {e}")
            return None
    
    @staticmethod
    def create_session(user_id, expires_hours=24):
        try:
            collection = Session.get_collection()
            if collection is None:
                raise Exception("Sessions collection is unavailable")
            
            # Generate a secure random token
            token = hashlib.sha256(f"{user_id}:{secrets.token_hex(32)}".encode()).hexdigest()
            
            session_data = {
                'token': token,
                'user_id': user_id,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(hours=expires_hours),
                'is_active': True
            }
            
            collection.insert_one(session_data)
            return token
            
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return None
    
    @staticmethod
    def verify_session(token):
        try:
            collection = Session.get_collection()
            if collection is None:
                return None
            
            # Find an active session that hasn't expired
            session = collection.find_one({
                'token': token,
                'is_active': True,
                'expires_at': {'$gt': datetime.utcnow()}
            })
            
            if session:
                return session['user_id']
            return None
            
        except Exception as e:
            logger.error(f"Error verifying session: {e}")
            return None
    
    @staticmethod
    def invalidate_session(token):
        try:
            collection = Session.get_collection()
            if collection is None:
                return False
                
            collection.update_one(
                {'token': token},
                {'$set': {'is_active': False}}
            )
            return True
        except Exception as e:
            logger.error(f"Error invalidating session: {e}")
            return False