from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client[Config.DB_NAME]

def test_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception as e:
        return False

