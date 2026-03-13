from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.ai_scheduling_service import run_scheduling_agent

ai_schedule_bp = Blueprint("ai_schedule", __name__, url_prefix="/ai/schedule")


@ai_schedule_bp.route("/project", methods=["POST"])
@jwt_required()
def schedule_project():
    data = request.get_json()
    project_id = data.get("project_id")

    if not project_id:
        return jsonify({"error": "project_id required"}), 400

    result = run_scheduling_agent(project_id)
    return jsonify(result), 200
