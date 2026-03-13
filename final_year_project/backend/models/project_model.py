from datetime import datetime
from bson import ObjectId
from database.mongodb import db

# MongoDB collection
project_collection = db["projects"]

def get_project_document(
    name: str,
    team_id: ObjectId,
    created_by: ObjectId,
    description: str = "",
    start_date: datetime | None = None,
    end_date: datetime | None = None
):
    """
    Returns a project document structure.
    """

    return {
        "name": name,
        "description": description,

        "team_id": team_id,

        "members": [
            {
                "user_id": created_by,
                "role": "owner",   # owner | contributor
                "joined_at": datetime.utcnow()
            }
        ],

        "timeline": {
            "start_date": start_date,
            "end_date": end_date,
            "status": "active"  # active | completed | archived
        },

        "stats": {
            "total_tasks": 0,
            "completed_tasks": 0,
            "progress": 0
        },

        "meta": {
            "created_by": created_by,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
    }
