from ai.agents.scheduling_agent import scheduling_agent


def run_scheduling_agent(project_id):
    return scheduling_agent.invoke({
        "project_id": project_id
    })
