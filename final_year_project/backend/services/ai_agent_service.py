from ai.agents.task_allocation_agent import task_allocation_agent


def run_task_allocation_agent(task_title, team_member_ids):
    return task_allocation_agent.invoke({
        "task_title": task_title,
        "team_member_ids": team_member_ids
    })
