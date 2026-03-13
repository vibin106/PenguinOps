from bson import ObjectId
from models.user_model import user_collection
from models.task_model import task_collection
from models.badge_model import badge_collection


def get_user_stats(user_id):
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    return {
        "total_xp": user["stats"]["total_xp"],
        "level": user["stats"]["level"],
        "tasks_completed": user["stats"]["tasks_completed"]
    }


def get_pending_tasks(user_id):
    tasks = list(task_collection.find({
        "assigned_to": ObjectId(user_id),
        "status.state": {"$ne": "completed"}
    }))
    return [{"title": t["title"], "priority": t["priority"]} for t in tasks]


def get_user_badges(user_id):
    badges = list(badge_collection.find({
        "awarded_to": ObjectId(user_id)
    }))
    return [b["name"] for b in badges]
