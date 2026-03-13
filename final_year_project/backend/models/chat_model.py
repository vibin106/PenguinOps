from datetime import datetime
from bson import ObjectId
from database.mongodb import db

# MongoDB collection
chat_collection = db["chats"]

def get_chat_message(
    sender_id: ObjectId,
    message: str,
    context_type: str,      # team | project | ai
    context_id: ObjectId | None = None
):
    """
    Returns a chat message document.
    """

    return {
        "sender_id": sender_id,
        "message": message,

        "context": {
            "type": context_type,
            "id": context_id
        },

        "meta": {
            "sent_at": datetime.utcnow(),
            "is_deleted": False
        }
    }
