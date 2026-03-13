from datetime import datetime
from database.mongodb import db

# MongoDB collection
user_collection = db["users"]

def get_user_document(
    name: str,
    email: str,
    password: str,
    role: str = "member"
):
    """
    Returns a user document structure.
    NOTE:
    - Password is plain for now (hashed in Phase 3)
    - This function DOES NOT insert into DB
    """

    return {
        "name": name,
        "email": email.lower(),
        "password": password,
        "role": role,  # admin | manager | member

        "profile": {
            "avatar": "penguin_default.png",
            "bio": ""
        },

        "stats": {
            "total_xp": 0,
            "level": 1,
            "tasks_completed": 0
        },

        "user_profile": {
            "skills": [],  # [{ name: "backend", level: "intermediate" }]
            "experience": {
                "backend_tasks": 0,
                "frontend_tasks": 0,
                "ai_tasks": 0
            },
            "availability": {
                "current_tasks": 0,
                "max_tasks": 5
            }
        },       

        "meta": {
            "created_at": datetime.utcnow(),
            "is_active": True
        }
    }
