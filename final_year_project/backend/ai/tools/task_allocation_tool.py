"""
Task Allocation Tool
LangChain Core compatible (Python 3.12)
"""

from services.ai_task_allocator import recommend_users


def task_allocation_tool(inputs: dict):
    """
    Tool function for AI agent.
    """
    task_title = inputs["task_title"]
    team_member_ids = inputs["team_member_ids"]

    return recommend_users(task_title, team_member_ids)
