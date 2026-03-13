from datetime import datetime
from bson import ObjectId
from database.mongodb import db

# MongoDB collection
badge_collection = db["badges"]

def get_badge_document(
    name: str,
    description: str,
    icon: str = "default_badge.png",
    awarded_to: ObjectId | None = None
):
    """
    Returns a badge document.
    """

    return {
        "name": name,
        "description": description,
        "icon": icon,

        "awarded_to": awarded_to,   # user_id (null for global badge)

        "meta": {
            "created_at": datetime.utcnow(),
            "awarded_at": datetime.utcnow() if awarded_to else None,
            "is_active": True
        }
    }
