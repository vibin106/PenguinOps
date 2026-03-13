from datetime import datetime
from bson import ObjectId
from database.mongodb import db

# MongoDB collection
xp_collection = db["xp_logs"]

def get_xp_document(
    user_id: ObjectId,
    source: str,
    amount: int,
    task_id: ObjectId | None = None,
    project_id: ObjectId | None = None,
    team_id: ObjectId | None = None
):
    """
    Returns an XP log document.
    """

    return {
        "user_id": user_id,

        "amount": amount,          # XP gained
        "source": source,          # task_completion | bonus | penalty

        "context": {
            "task_id": task_id,
            "project_id": project_id,
            "team_id": team_id
        },

        "meta": {
            "created_at": datetime.utcnow()
        }
    }
