from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.chat_service import send_message, get_messages

chat_bp = Blueprint("chat", __name__, url_prefix="/chats")


@chat_bp.route("/", methods=["POST"])
@jwt_required()
def post_message():
    user_id = get_jwt_identity()
    data = request.get_json()

    message = data.get("message")
    context_type = data.get("context_type")   # team | project
    context_id = data.get("context_id")

    if not all([message, context_type, context_id]):
        return jsonify({"error": "message, context_type, context_id required"}), 400

    msg_id = send_message(
        sender_id=user_id,
        message=message,
        context_type=context_type,
        context_id=context_id
    )

    return jsonify({
        "message": "Chat message sent",
        "chat_id": msg_id
    }), 201


@chat_bp.route("/<context_type>/<context_id>", methods=["GET"])
@jwt_required()
def fetch_messages(context_type, context_id):
    messages = get_messages(context_type, context_id)
    return jsonify(messages), 200
