from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

protected_bp = Blueprint("protected", __name__, url_prefix="/protected")


@protected_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    claims = get_jwt()

    return jsonify({
        "message": "Protected route accessed",
        "user_id": user_id,
        "role": claims.get("role"),
        "email": claims.get("email")
    })
