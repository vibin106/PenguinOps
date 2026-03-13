from bson import ObjectId
from models.user_model import user_collection


def update_user_skills(user_id, skills):
    """
    skills = [
      { "name": "backend", "level": "intermediate" }
    ]
    """

    user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "user_profile.skills": skills
            }
        }
    )

    return True


def get_user_skills(user_id):
    user = user_collection.find_one(
        {"_id": ObjectId(user_id)},
        {"user_profile.skills": 1}
    )
    return user.get("user_profile", {}).get("skills", [])
