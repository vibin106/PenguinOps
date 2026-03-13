from datetime import datetime
from bson import ObjectId
from database.mongodb import db

# MongoDB collection
task_collection = db["tasks"]

def get_task_document(
    title: str,
    project_id: ObjectId,
    created_by: ObjectId,
    assigned_to: ObjectId | None = None,
    description: str = "",
    priority: str = "medium",
    xp_reward: int = 10,
    due_date: datetime | None = None
):
    """
    Returns a task (mission) document structure.
    """

    return {
        "title": title,
        "description": description,

        "project_id": project_id,

        "assignment": {
            "assigned_to": assigned_to,
            "assigned_at": datetime.utcnow() if assigned_to else None
        },

        "status": {
            "state": "pending",   # pending | in_progress | completed
            "completed_at": None
        },

        "priority": priority,   # low | medium | high
        "xp_reward": xp_reward,

        "timeline": {
            "created_at": datetime.utcnow(),
            "due_date": due_date
        },

        "meta": {
            "created_by": created_by,
            "is_active": True
        }
    }
