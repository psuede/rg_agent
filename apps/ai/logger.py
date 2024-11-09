import logging
from logging.handlers import RotatingFileHandler
from rich.console import Console
from rich.logging import RichHandler
from rich.panel import Panel
from pathlib import Path
from datetime import datetime

# Set up Rich console and logging configuration
console = Console()
Path("logs").mkdir(exist_ok=True)

handler = RotatingFileHandler('logs/agent.log', maxBytes=5*1024*1024, backupCount=5)
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    handlers=[
        RichHandler(rich_tracebacks=True, console=console),
        handler
    ]
)

logger = logging.getLogger("AgentLogger")

def format_message_for_log(text: str) -> str:
    """Format text into multiple lines with proper indentation."""
    lines = []
    current_line = ""
    words = text.split()
    
    for word in words:
        if len(current_line) + len(word) + 1 <= 80:
            current_line += f"{word} "
        else:
            lines.append(current_line)
            current_line = f"{word} "
    
    if current_line:
        lines.append(current_line)
    
    return "\n    " + "\n    ".join(line.rstrip() for line in lines)

class AgentLogger:
    def log_message(self, message: str) -> None:
        """Log a message with proper formatting."""
        logger.info(message)
    
    def log_user_input(self, input_text: str) -> None:
        """Log user input with formatting."""
        formatted = f"User Input: {format_message_for_log(input_text)}"
        logger.info(formatted)
    
    def log_model_call(self, model_name: str, model_id: str) -> None:
        """Log when a model is being called."""
        logger.info(f"Calling {model_name} ({model_id})")
    
    def log_response(self, model_name: str, response: str) -> None:
        """Log model responses with formatting."""
        header = f"Response from {model_name}:"
        formatted = f"{header}{format_message_for_log(response)}"
        logger.info(formatted)
    
    def log_task(self, task: str) -> None:
        """Log task prompt with formatting."""
        formatted = f"Task prompt: {format_message_for_log(task)}"
        logger.info(formatted)
    
    def log_final(self, output: str) -> None:
        """Log final output with formatting."""
        formatted = f"Final Output: {format_message_for_log(output)}"
        logger.info(formatted)
    
    def log_error(self, error: str) -> None:
        """Log errors."""
        logger.error(f"ERROR: {error}")