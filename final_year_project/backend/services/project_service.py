from bson import ObjectId
from models.project_model import project_collection, get_project_document

def create_project(name, team_id, created_by, description=""):
    project_doc = get_project_document(
        name=name,
        team_id=ObjectId(team_id),
        created_by=ObjectId(created_by),
        description=description
    )

    result = project_collection.insert_one(project_doc)
    return str(result.inserted_id)


def get_projects_for_user(user_id):
    """
    Fetch projects where user is a member
    """
    projects = project_collection.find({
        "members.user_id": ObjectId(user_id),
        "meta.is_active": True
    })

    return list(projects)
