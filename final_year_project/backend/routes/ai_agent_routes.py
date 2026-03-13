from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.ai_agent_service import run_task_allocation_agent

ai_agent_bp = Blueprint("ai_agent", __name__, url_prefix="/ai/agent")


@ai_agent_bp.route("/task-allocation", methods=["POST"])
@jwt_required()
def allocate_task():
    data = request.get_json()

    task_title = data.get("task_title")
    team_member_ids = data.get("team_member_ids")

    if not task_title or not team_member_ids:
        return jsonify({"error": "task_title and team_member_ids required"}), 400

    result = run_task_allocation_agent(task_title, team_member_ids)

    return jsonify({
        "agent_response": result
    }), 200
