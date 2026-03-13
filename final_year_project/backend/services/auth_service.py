from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import user_collection, get_user_document

def register_user(name, email, password, role="member"):
    """
    Registers a new user with hashed password.
    """

    # Check if user already exists
    existing_user = user_collection.find_one({"email": email.lower()})
    if existing_user:
        return None, "User already exists"

    hashed_password = generate_password_hash(password)

    user_doc = get_user_document(
        name=name,
        email=email,
        password=hashed_password,
        role=role
    )

    result = user_collection.insert_one(user_doc)
    return str(result.inserted_id), None


def authenticate_user(email, password):
    """
    Authenticates user credentials.
    """

    user = user_collection.find_one({"email": email.lower()})
    if not user:
        return None, "Invalid email or password"

    if not check_password_hash(user["password"], password):
        return None, "Invalid email or password"

    return user, None
