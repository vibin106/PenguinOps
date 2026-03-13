from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ai_chatbot_service import run_chatbot_agent

ai_chatbot_bp = Blueprint("ai_chatbot", __name__, url_prefix="/ai/chatbot")


@ai_chatbot_bp.route("/", methods=["POST"])
@jwt_required()
def chat_with_ai():
    user_id = get_jwt_identity()
    message = request.json.get("message")

    if not message:
        return jsonify({"error": "message required"}), 400

    result = run_chatbot_agent(user_id, message)
    return jsonify(result), 200
