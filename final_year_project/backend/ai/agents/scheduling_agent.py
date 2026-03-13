from langchain_core.runnables import RunnableLambda
from langchain_groq import ChatGroq

from services.ai_scheduling_logic import generate_schedule


llm = ChatGroq(
    model="llama3-70b-8192",
    temperature=0
)


def scheduling_agent_logic(inputs: dict):
    project_id = inputs["project_id"]

    schedule = generate_schedule(project_id)

    prompt = f"""
You are an AI scheduling agent.

Here is the proposed task order:
{schedule}

Explain why this schedule is optimal.
"""

    explanation = llm.invoke(prompt).content

    return {
        "agent": "SchedulingAgent",
        "llm_explanation": explanation,
        "schedule": schedule
    }


scheduling_agent = RunnableLambda(scheduling_agent_logic)
