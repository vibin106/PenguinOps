from bson import ObjectId
from models.xp_model import xp_collection, get_xp_document
from models.user_model import user_collection
from services.badge_service import (
    check_first_task_badge,
    check_100_xp_badge
)

def calculate_level(total_xp):
    """
    Simple level logic:
    Every 100 XP = 1 level
    """
    return (total_xp // 100) + 1


def award_xp(user_id, amount, source, task_id=None, project_id=None, team_id=None):
    """
    1. Log XP event
    2. Update user's total XP and level
    3. Check & award badges
    """

    # 1️⃣ Insert XP log
    xp_doc = get_xp_document(
        user_id=ObjectId(user_id),
        source=source,
        amount=amount,
        task_id=ObjectId(task_id) if task_id else None,
        project_id=ObjectId(project_id) if project_id else None,
        team_id=ObjectId(team_id) if team_id else None
    )

    xp_collection.insert_one(xp_doc)

    # 2️⃣ Fetch current user XP
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    current_xp = user["stats"]["total_xp"]

    new_total_xp = current_xp + amount
    new_level = calculate_level(new_total_xp)

    # 3️⃣ Update user stats
    user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "stats.total_xp": new_total_xp,
                "stats.level": new_level
            }
        }
    )

    # 4️⃣ 🏅 Badge checks (THIS IS WHERE THEY BELONG)
    check_first_task_badge(user_id)
    check_100_xp_badge(user_id)

    return {
        "total_xp": new_total_xp,
        "level": new_level
    }
