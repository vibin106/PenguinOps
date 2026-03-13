from datetime import datetime
from database.mongodb import db
from bson import ObjectId

# MongoDB collection
team_collection = db["teams"]

def get_team_document(
    name: str,
    created_by: ObjectId,
    description: str = ""
):
    """
    Returns a team document structure.
    """

    return {
        "name": name,
        "description": description,

        "members": [
            {
                "user_id": created_by,
                "role": "leader",   # leader | member
                "joined_at": datetime.utcnow()
            }
        ],

        "stats": {
            "total_xp": 0,
            "level": 1
        },

        "meta": {
            "created_by": created_by,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
    }
