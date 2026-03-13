from flask import Blueprint, request, jsonify
from bson import ObjectId
from database.mongodb import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

team_routes = Blueprint("team_routes", __name__)

team_collection = db["teams"]

@team_routes.route("/teams", methods=["POST"])
@jwt_required()
def create_team():
    user_id = get_jwt_identity()
    data = request.json

    if not data.get("name"):
        return jsonify({"error": "Team name required"}), 400

    team = {
        "name": data["name"],
        "members": [
            {
                "user_id": ObjectId(user_id),
                "role": "owner",
                "joined_at": datetime.utcnow()
            }
        ],
        "meta": {
            "created_by": ObjectId(user_id),
            "created_at": datetime.utcnow()
        }
    }

    # Add extra members if provided
    for member_id in data.get("members", []):
        team["members"].append({
            "user_id": ObjectId(member_id),
            "role": "member",
            "joined_at": datetime.utcnow()
        })

    result = team_collection.insert_one(team)

    return jsonify({
        "message": "Team created",
        "team_id": str(result.inserted_id)
    }), 201
