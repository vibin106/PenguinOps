
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.health import bp
from routes.auth_routes import auth_bp
from routes.protected_routes import protected_bp
from routes.project_routes import project_bp
from routes.task_routes import task_bp
from routes.team_routes import team_routes
from routes.chat_routes import chat_bp
from routes.skill_routes import skill_bp
from routes.ai_task_routes import ai_task_bp
from routes.ai_agent_routes import ai_agent_bp
from routes.ai_scheduling_routes import ai_schedule_bp
from routes.ai_chatbot_routes import ai_chatbot_bp
from config import Config

app = Flask(
    __name__,
    static_folder="../frontend",
    template_folder="../frontend"
)
CORS(app)

# JWT configuration
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
jwt = JWTManager(app)

# Existing routes
app.register_blueprint(bp)
app.register_blueprint(auth_bp)
app.register_blueprint(protected_bp)
app.register_blueprint(project_bp)
app.register_blueprint(task_bp)
app.register_blueprint(team_routes)
app.register_blueprint(chat_bp)
app.register_blueprint(skill_bp)
app.register_blueprint(ai_task_bp)
app.register_blueprint(ai_agent_bp)
app.register_blueprint(ai_schedule_bp)
app.register_blueprint(ai_chatbot_bp)

# ── Frontend serving ──────────────────────────────────────────────
@app.route("/")
def serve_index():
    return send_from_directory("../frontend", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("../frontend", path)
# ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True)
