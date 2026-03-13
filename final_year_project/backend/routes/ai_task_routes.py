from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.ai_task_allocator import recommend_users

ai_task_bp = Blueprint("ai_task", __name__, url_prefix="/ai/tasks")


@ai_task_bp.route("/recommend", methods=["POST"])
@jwt_required()
def recommend_task_assignment():
    data = request.get_json()

    task_title = data.get("task_title")
    team_member_ids = data.get("team_member_ids")

    if not task_title or not team_member_ids:
        return jsonify({"error": "task_title and team_member_ids required"}), 400

    result = recommend_users(task_title, team_member_ids)
    return jsonify(result), 200
