from langchain_core.runnables import RunnableLambda
from langchain_groq import ChatGroq

from ai.tools.chatbot_tools import (
    get_user_stats,
    get_pending_tasks,
    get_user_badges
)


llm = ChatGroq(
    model="llama3-70b-8192",
    temperature=0
)


def chatbot_logic(inputs: dict):
    user_id = inputs["user_id"]
    message = inputs["message"].lower()

    context = {}

    if "xp" in message or "level" in message:
        context["stats"] = get_user_stats(user_id)

    if "task" in message:
        context["tasks"] = get_pending_tasks(user_id)

    if "badge" in message:
        context["badges"] = get_user_badges(user_id)

    prompt = f"""
You are PenguinOps AI Assistant.

User asked:
{message}

System data:
{context}

Respond clearly and helpfully.
"""

    response = llm.invoke(prompt).content

    return {
        "agent": "PenguinOpsChatbot",
        "response": response,
        "context_used": list(context.keys())
    }


chatbot_agent = RunnableLambda(chatbot_logic)
