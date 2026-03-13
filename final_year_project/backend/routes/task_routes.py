from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services.task_service import (
    create_task,
    get_tasks_by_project,
    update_task_status
)

task_bp = Blueprint("tasks", __name__, url_prefix="/tasks")


@task_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    claims = get_jwt()
    user_id = get_jwt_identity()
    data = request.get_json()

    if claims.get("role") not in ["admin", "manager"]:
        return jsonify({"error": "Not authorized to create tasks"}), 403

    title = data.get("title")
    project_id = data.get("project_id")

    if not all([title, project_id]):
        return jsonify({"error": "title and project_id required"}), 400

    task_id = create_task(
        title=title,
        project_id=project_id,
        created_by=user_id,
        assigned_to=data.get("assigned_to"),
        description=data.get("description", ""),
        priority=data.get("priority", "medium"),
        xp_reward=data.get("xp_reward", 10)
    )

    return jsonify({
        "message": "Task created",
        "task_id": task_id
    }), 201


@task_bp.route("/project/<project_id>", methods=["GET"])
@jwt_required()
def list_by_project(project_id):
    tasks = get_tasks_by_project(project_id)

    response = []
    for t in tasks:
        response.append({
            "id": str(t["_id"]),
            "title": t["title"],
            "status": t["status"]["state"],
            "priority": t["priority"],
            "xp_reward": t["xp_reward"]
        })

    return jsonify(response), 200


@task_bp.route("/<task_id>/status", methods=["PUT"])
@jwt_required()
def update_status(task_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ["pending", "in_progress", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    user_id = get_jwt_identity()
    update_task_status(task_id, status, completed_by=user_id)


    return jsonify({
        "message": "Task status updated",
        "status": status
    }), 200
