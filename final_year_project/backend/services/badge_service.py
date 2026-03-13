from bson import ObjectId
from models.badge_model import badge_collection, get_badge_document
from models.xp_model import xp_collection
from models.user_model import user_collection


def award_badge_if_not_exists(user_id, name, description):
    """
    Awards a badge only once per user
    """
    existing = badge_collection.find_one({
        "name": name,
        "awarded_to": ObjectId(user_id)
    })

    if existing:
        return False

    badge = get_badge_document(
        name=name,
        description=description,
        awarded_to=ObjectId(user_id)
    )

    badge_collection.insert_one(badge)
    return True


def check_first_task_badge(user_id):
    """
    First Task Completed badge
    """
    completed_tasks = xp_collection.count_documents({
        "user_id": ObjectId(user_id),
        "source": "task_completion"
    })

    if completed_tasks == 1:
        award_badge_if_not_exists(
            user_id,
            name="First Task",
            description="Completed your first task 🎉"
        )


def check_100_xp_badge(user_id):
    """
    100 XP badge
    """
    user = user_collection.find_one({"_id": ObjectId(user_id)})

    if user["stats"]["total_xp"] >= 100:
        award_badge_if_not_exists(
            user_id,
            name="100 XP Club",
            description="Earned 100 XP 💯"
        )
