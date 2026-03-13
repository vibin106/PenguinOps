from ai.agents.chatbot_agent import chatbot_agent


def run_chatbot_agent(user_id, message):
    return chatbot_agent.invoke({
        "user_id": user_id,
        "message": message
    })
