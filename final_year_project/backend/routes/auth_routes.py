from flask import Blueprint, request, jsonify
from services.auth_service import register_user, authenticate_user
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "member")

    if not all([name, email, password]):
        return jsonify({"error": "Name, email and password are required"}), 400

    user_id, error = register_user(name, email, password, role)

    if error:
        return jsonify({"error": error}), 409

    return jsonify({
        "message": "User registered successfully",
        "user_id": user_id
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    user, error = authenticate_user(email, password)

    if error:
        return jsonify({"error": error}), 401

    # 🔐 NEW: Create JWT token
    access_token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={
            "role": user["role"],
            "email": user["email"]
        }
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,   # NEW
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200
