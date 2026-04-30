from pymongo import MongoClient # type: ignore
from pymongo.errors import ConnectionFailure # type: ignore
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDB:
    _instance = None
    client = None
    db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance
    
    def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            mongo_uri = os.environ.get('MONGO_URI')
            
            if not mongo_uri:
                logger.error("❌ MONGO_URI not found in environment variables!")
                return False
            
            logger.info("🔄 Connecting to MongoDB Atlas...")
            
            self.client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                maxPoolSize=50
            )
            
            # Test connection
            self.client.admin.command('ping')
            
            # Get database
            self.db = self.client['textguard_ai']
            
            # Create indexes
            self._create_indexes()
            
            logger.info("✅ MongoDB Atlas connected successfully!")
            return True
            
        except ConnectionFailure as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            return False
    
    def _create_indexes(self):
        """Create necessary indexes"""
        try:
            # Explicitly check if db is None
            if self.db is None:
                return

            self.db.users.create_index("email", unique=True)
            self.db.users.create_index("user_id", unique=True)
            self.db.sessions.create_index("token", unique=True)
            self.db.sessions.create_index("expires_at", expireAfterSeconds=0)
            logger.info("✅ Database indexes created")
        except Exception as e:
            logger.warning(f"⚠️ Index creation warning: {e}")
    
    def get_collection(self, name):
        # FIX: Changed 'if not self.db' to 'if self.db is None'
        if self.db is None:
            raise Exception("Database not connected")
        return self.db[name]
    
    def get_users_collection(self):
        return self.get_collection('users')
    
    def get_sessions_collection(self):
        return self.get_collection('sessions')
    
    def get_status(self):
        # FIX: Changed 'if not self.client' to 'if self.client is None'
        if self.client is None:
            return {'connected': False}
        try:
            self.client.admin.command('ping')
            return {
                'connected': True,
                # FIX: Explicit check for self.db
                'database_name': self.db.name if self.db is not None else None
            }
        except:
            return {'connected': False}

mongodb = MongoDB()