from fastapi import FastAPI
from agent import agent_process, agent_generate_memory
from logger import console
from rich.panel import Panel
from agenttypes import Prompt, PromptType

app = FastAPI()


@app.post("/prompt/")
async def root(prompt : Prompt):
    input_data = {
        "user_input": prompt.user_input,
        "metadata": {
            "name" : prompt.name,
            "prompt_type" : prompt.prompt_type,
            "task_id": "example_002",
            "source": "user",
            "curator_mode": False,
            "creator_engaged": True
        }
    }

    console.print(Panel("🚀 Starting Agent Process", style="bold blue"))
    result = agent_process(input_data)
    console.print(Panel(f"✨ Final Output:\n\n{result}", title="Result", border_style="green"))
    return result

@app.get("/generatememory/{type}")
async def root(type : str):
    gentype = PromptType(type)
    console.print(Panel("🚀 Generating long term memory for " + gentype, style="bold blue"))
    result = agent_generate_memory(gentype)
    console.print(Panel(f"✨ Long term memory output:\n\n{result}", title="Result", border_style="green"))
    return result