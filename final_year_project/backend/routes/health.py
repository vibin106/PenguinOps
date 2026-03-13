from flask import Blueprint, jsonify
from database.mongodb import test_connection

bp = Blueprint("health", __name__)

@bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "db": test_connection()
    })
