from langchain_core.runnables import RunnableLambda
from langchain_groq import ChatGroq

from ai.tools.task_allocation_tool import task_allocation_tool


llm = ChatGroq(
    model="llama3-70b-8192",
    groq_api_key="YOUR_GROQ_API_KEY"
)


def agent_logic(inputs: dict):
    task_title = inputs["task_title"]
    team_member_ids = inputs["team_member_ids"]

    prompt = f"""
You are an AI task allocation agent.

Task: {task_title}
Team members: {team_member_ids}

Explain who should do the task and why.
"""

    reasoning = llm.invoke(prompt).content

    allocation = task_allocation_tool({
        "task_title": task_title,
        "team_member_ids": team_member_ids
    })

    return {
        "agent": "TaskAllocationAgent",
        "llm_reasoning": reasoning,
        "recommendation": allocation
    }


task_allocation_agent = RunnableLambda(agent_logic)
