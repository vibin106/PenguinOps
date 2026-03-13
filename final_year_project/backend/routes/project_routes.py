from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services.project_service import create_project, get_projects_for_user

project_bp = Blueprint("projects", __name__, url_prefix="/projects")


@project_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    data = request.get_json()
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims.get("role") not in ["admin", "manager"]:
        return jsonify({"error": "Not authorized"}), 403

    name = data.get("name")
    team_id = data.get("team_id")
    description = data.get("description", "")

    if not all([name, team_id]):
        return jsonify({"error": "Project name and team_id required"}), 400

    project_id = create_project(name, team_id, user_id, description)

    return jsonify({
        "message": "Project created",
        "project_id": project_id
    }), 201


@project_bp.route("/", methods=["GET"])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    projects = get_projects_for_user(user_id)

    response = []
    for p in projects:
        response.append({
            "id": str(p["_id"]),
            "name": p["name"],
            "description": p["description"],
            "status": p["timeline"]["status"]
        })

    return jsonify(response), 200
