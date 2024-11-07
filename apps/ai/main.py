from fastapi import FastAPI
from pydantic import BaseModel
from agent import agent_process
from logger import console
from rich.panel import Panel

app = FastAPI()

class Prompt(BaseModel):
    user_input: str

@app.post("/prompt/")
async def root(prompt : Prompt):    
    input_data = {
        "user_input": prompt.user_input,
        "metadata": {
            "task_id": "example_002",
            "source": "user",
            "curator_mode": False,
            "creator_engaged": True
        }
    }

    console.print(Panel("🚀 Starting Agent Process", style="bold blue"))
    result = agent_process(input_data)
    console.print(Panel(f"✨ Final Output:\n\n{result}", title="Result", border_style="green"))
    return {"message": result}