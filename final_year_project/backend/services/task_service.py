from bson import ObjectId
from models.task_model import task_collection, get_task_document
from services.gamification_service import award_xp

def create_task(
    title,
    project_id,
    created_by,
    assigned_to=None,
    description="",
    priority="medium",
    xp_reward=10,
    due_date=None
):
    task_doc = get_task_document(
        title=title,
        project_id=ObjectId(project_id),
        created_by=ObjectId(created_by),
        assigned_to=ObjectId(assigned_to) if assigned_to else None,
        description=description,
        priority=priority,
        xp_reward=xp_reward,
        due_date=due_date
    )

    result = task_collection.insert_one(task_doc)
    return str(result.inserted_id)


def get_tasks_by_project(project_id):
    tasks = task_collection.find({
        "project_id": ObjectId(project_id),
        "meta.is_active": True
    })
    return list(tasks)


def update_task_status(task_id, status, completed_by=None):
    task = task_collection.find_one({"_id": ObjectId(task_id)})

    if not task:
        return None

    update_data = {
        "status.state": status,
        "status.completed_at": (
            None if status != "completed"
            else __import__("datetime").datetime.utcnow()
        )
    }

    task_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_data}
    )

    # 🎮 Gamification hook
    if status == "completed" and completed_by:
        award_xp(
            user_id=completed_by,
            amount=task["xp_reward"],
            source="task_completion",
            task_id=task_id,
            project_id=task["project_id"]
        )

    return True

