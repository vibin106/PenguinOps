from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.skill_service import update_user_skills, get_user_skills

skill_bp = Blueprint("skills", __name__, url_prefix="/skills")


@skill_bp.route("/", methods=["POST"])
@jwt_required()
def set_skills():
    user_id = get_jwt_identity()
    data = request.get_json()
    skills = data.get("skills")

    if not skills:
        return jsonify({"error": "skills required"}), 400

    update_user_skills(user_id, skills)

    return jsonify({
        "message": "Skills updated successfully"
    }), 200


@skill_bp.route("/me", methods=["GET"])
@jwt_required()
def my_skills():
    user_id = get_jwt_identity()
    skills = get_user_skills(user_id)

    return jsonify({
        "skills": skills
    }), 200
