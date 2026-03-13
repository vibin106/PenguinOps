from datetime import datetime
from bson import ObjectId
from models.task_model import task_collection
from models.user_model import user_collection


def priority_score(priority):
    return {
        "high": 50,
        "medium": 30,
        "low": 10
    }.get(priority, 10)


def urgency_score(due_date):
    if not due_date:
        return 0

    days_left = (due_date - datetime.utcnow()).days
    if days_left <= 0:
        return 40
    if days_left <= 2:
        return 30
    if days_left <= 5:
        return 20
    return 10


def overload_penalty(user_id):
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return 0

    availability = user.get("user_profile", {}).get("availability", {})
    current_tasks = availability.get("current_tasks", 0)
    max_tasks = availability.get("max_tasks", 5)

    if current_tasks >= max_tasks:
        return 30
    return 0


def generate_schedule(project_id):
    tasks = list(task_collection.find({
        "project_id": ObjectId(project_id),
        "status.state": {"$ne": "completed"}
    }))

    schedule = []

    for task in tasks:
        score = 0
        reasons = []

        # Priority
        p_score = priority_score(task.get("priority", "low"))
        score += p_score
        reasons.append(f"Priority score: {p_score}")

        # Urgency
        due_date = task.get("due_date")
        u_score = urgency_score(due_date)
        score += u_score
        if due_date:
            reasons.append(f"Urgency score: {u_score}")

        # Workload
        assigned_to = task.get("assigned_to")
        if assigned_to:
            penalty = overload_penalty(assigned_to)
            score -= penalty
            if penalty:
                reasons.append("Assigned user workload is high")

        schedule.append({
            "task_id": str(task["_id"]),
            "title": task["title"],
            "score": score,
            "reasons": reasons
        })

    schedule.sort(key=lambda x: x["score"], reverse=True)
    return schedule
