from bson import ObjectId
from models.chat_model import chat_collection, get_chat_message


def send_message(sender_id, message, context_type, context_id=None):
    chat_doc = get_chat_message(
        sender_id=ObjectId(sender_id),
        message=message,
        context_type=context_type,
        context_id=ObjectId(context_id) if context_id else None
    )

    result = chat_collection.insert_one(chat_doc)
    return str(result.inserted_id)


def get_messages(context_type, context_id):
    messages = chat_collection.find({
        "context.type": context_type,
        "context.id": ObjectId(context_id),
        "meta.is_deleted": False
    }).sort("meta.sent_at", 1)

    response = []
    for msg in messages:
        response.append({
            "id": str(msg["_id"]),
            "sender_id": str(msg["sender_id"]),
            "message": msg["message"],
            "sent_at": msg["meta"]["sent_at"]
        })

    return response
