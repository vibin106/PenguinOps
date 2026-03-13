from models.user_model import user_collection
from bson import ObjectId


def infer_required_skill(task_title):
    title = task_title.lower()
    if "api" in title or "backend" in title:
        return "backend"
    if "ui" in title or "frontend" in title:
        return "frontend"
    return "general"


def score_user(user, required_skill):
    score = 0
    reasons = []

    skills = user.get("user_profile", {}).get("skills", [])
    experience = user.get("user_profile", {}).get("experience", {})
    availability = user.get("user_profile", {}).get("availability", {})

    # Skill match
    for s in skills:
        if s["name"] == required_skill:
            score += 50
            reasons.append(f"Has {required_skill} skill ({s['level']})")

    # Experience
    exp_key = f"{required_skill}_tasks"
    exp_count = experience.get(exp_key, 0)
    if exp_count > 0:
        exp_score = min(exp_count * 5, 30)
        score += exp_score
        reasons.append(f"Completed {exp_count} similar tasks")

    # Availability
    current = availability.get("current_tasks", 0)
    max_tasks = availability.get("max_tasks", 5)

    if current < max_tasks:
        score += 20
        reasons.append("Has available workload")

    return score, reasons


def recommend_users(task_title, team_member_ids):
    required_skill = infer_required_skill(task_title)

    recommendations = []

    for uid in team_member_ids:
        user = user_collection.find_one({"_id": ObjectId(uid)})
        if not user:
            continue

        score, reasons = score_user(user, required_skill)

        recommendations.append({
            "user_id": str(user["_id"]),
            "name": user["name"],
            "score": score,
            "reasons": reasons
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)

    return {
        "required_skill": required_skill,
        "recommendations": recommendations
    }
