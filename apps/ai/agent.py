from openai import OpenAI
from anthropic import Anthropic
from openpipe import OpenAI as OpenPipeAI
import os
import json
import threading
import requests
import yaml
from typing import Dict, List, Any, Optional, Set
from pathlib import Path
from rich.panel import Panel
from logger import AgentLogger, console, logger
from redis import Redis
from dataclasses import dataclass
from agenttypes import PromptType, MemoryGeneration

with open('config.json', 'r') as file:
    config = json.load(file)

env = os.getenv('ENV', 'development')
current_config = config.get(env)

def extract_tag(input_text: str) -> Optional[str]:
    """Extract event tag from input text."""
    import re
    match = re.search(r'<([^>]+)>', input_text)
    return match.group(1) if match else None

# Initialize MODEL_SPECS
MODEL_SPECS = {
    "The Judge": {"api": "openai", "model": "gpt-3.5-turbo-0125"},
    "The Architect": {"api": "anthropic", "model": "claude-3-sonnet-20240229"},
    "The Dreamer": {"api": "openpipe", "model": "openpipe:gold-months-train"},
    "The Oracle": {"api": "openai", "model": "gpt-4-0125-preview"},
    "The One": {"api": "openpipe", "model": "openpipe:gold-months-train"},
    "The Old One": {"api": "anthropic", "model": "claude-3-sonnet-20240229"}
}

# Define your event tags and their corresponding Redis buckets
EVENT_TAGS = {
    PromptType.BUY: current_config['BUY_BUCKET_KEY'],
    PromptType.LOCK: current_config['LOCK_BUCKET_KEY'],
    PromptType.TWEET: current_config['TWEET_BUCKET_KEY'],
    PromptType.CHAT: current_config['CHAT_BUCKET_KEY'],
}

@dataclass
class EventContext:
    content: str
    timestamp: str
    metadata: Dict

class EventRAGReader:
    # Mapping of tags to Redis bucket names
    BUCKET_MAPPING = EVENT_TAGS
    
    def __init__(
        self,
        redis_host: str,
        redis_port: int,
        max_context_items: int = 10
    ):
        """Initialize read-only connection to Redis pub/sub system."""
        self.redis_client = Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True
        )
        self.max_context_items = max_context_items
        self._local = threading.local()
    
    def get_bucket_memory(self, memory_type: PromptType) -> List[str]:
        bucket = self.BUCKET_MAPPING.get(memory_type)
        bucket_items = self.redis_client.xrange(bucket, min='-', max='+')
        memory = ""
        for item_id, item_data in bucket_items:
            memory += item_data['output']
            memory += "\n"

        return memory

    def _get_relevant_buckets(self, prompt_type: PromptType) -> List[str]:
        """Get list of relevant Redis buckets for a given tag."""
        # Get primary buckets
        bucket = self.BUCKET_MAPPING.get(prompt_type)
        if bucket == None:
          return
        
        buckets = [bucket]

        # Add any cross-cutting buckets that should always be checked
        buckets.extend([current_config['LONG_TERM_MEMORY_KEY']])
        return buckets
    
    def get_recent_context(self, prompt_type: PromptType, limit: int = None) -> List[EventContext]:
        """Get recent context from relevant Redis buckets."""
        buckets = self._get_relevant_buckets(prompt_type)
        contexts = []
        
        for bucket in buckets:
            try:
                # Get latest items from the bucket
                                   
                items = self.redis_client.xrange(bucket, min='+', max='-') if bucket != current_config['LONG_TERM_MEMORY_KEY'] else self.redis_client.xrange(bucket, min='+', max='-', count=current_config['LONG_TERM_MEMORY_COUNT'])
                for item_id, item_data in items:
                    try:
                        contexts.append(EventContext(
                            content=item_data['output'],
                            timestamp=item_id.decode() if isinstance(item_id, bytes) else item_id,
                            metadata=json.loads(item_data.get('metadata', '{}'))
                        ))
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid metadata in {bucket}: {item_data}")
                        continue
                        
            except Exception as e:
                logger.error(f"Error reading from bucket {bucket}: {e}")
                continue
                
        return sorted(contexts, key=lambda x: x.timestamp, reverse=True)
    
    
    def prepare_context_message(self, prompt_type: PromptType) -> Optional[Dict[str, str]]:
        """Prepare context message for the agent based on input tag."""
        try:               
            contexts = self.get_recent_context(prompt_type)

            if not contexts:
                return None
                
            # Format context message
            context_parts = []
            for ctx in contexts:
                context_parts.append(
                    f"[{ctx.timestamp}] {ctx.content}\n"
                    f"Metadata: {json.dumps(ctx.metadata, indent=2)}"
                )
                
            return {
                "role": "system",
                "content": (
                    f"Recent {prompt_type.value} Context:\n\n" +
                    "\n---\n".join(context_parts)
                )
            }
        except Exception as e:
            logger.debug(f"RAG context retrieval skipped: {str(e)}")
            return None

# Initialize API clients
try:
    openpipe_client = OpenPipeAI(
        openpipe={"api_key": os.environ['RG_OPEN_PIPE_KEY'] }
    )
    openai_client = OpenAI(api_key=os.environ['RG_OPEN_AI_KEY'])
    anthropic_client = Anthropic(api_key=os.environ['RG_ANTHROPIC_KEY'])
    logger.info("✅ Successfully initialized all API clients")
except Exception as e:
    logger.error(f"❌ Failed to initialize API clients: {e}")
    raise

# initialization rag stuff
try:
    event_rag = EventRAGReader(
        redis_host=os.environ['RG_AGENT_REDIS_URL'],
        redis_port=6379,
        max_context_items=10
    )
    logger.info("✅ Successfully initialized RAG reader")
except Exception as e:
    logger.info("ℹ️ RAG reader not available - continuing without RAG functionality")
    event_rag = None

def enhance_agent_messages(
    event_rag: EventRAGReader,
    base_messages: List[Dict[str, str]],
    input_text: str
) -> List[Dict[str, str]]:
    """Enhance agent messages with event context while preserving tags."""
    messages = base_messages.copy()
    
    # Get RAG context
    if event_rag is not None:
        context_message = event_rag.prepare_context_message(input_text)
        if context_message:
            # Find best position to insert context
            system_index = next(
                (i for i, msg in enumerate(messages) if msg["role"] == "system"),
                -1
            )
            
            if system_index >= 0:
                messages.insert(system_index + 1, context_message)
            else:
                messages.insert(0, context_message)
    
    return messages

def prepare_model_messages(model_name: str, base_messages: List[Dict[str, str]], agent_logger: AgentLogger) -> List[Dict[str, str]]:
    """Prepare messages for a model, including its context, RAG data, and existing functionality."""
    messages = base_messages.copy()
    
    # Get user input message
    user_message = next((msg["content"] for msg in messages if msg["role"] == "user"), None)
    
    # Add RAG context if there's user input and event_rag is available
    if user_message and event_rag is not None:
        context_message = event_rag.prepare_context_message(user_message)
        if context_message:
            # Find system message index
            system_index = next((i for i, msg in enumerate(messages) if msg["role"] == "system"), -1)
            if system_index >= 0:
                messages.insert(system_index + 1, context_message)
            else:
                messages.insert(0, context_message)
    
    # Get and add static context (preserving your existing functionality)
    context = load_model_contexts(model_name)
    if context:
        system_prompt_index = next((i for i, msg in enumerate(messages) if msg["role"] == "system"), -1)
        if system_prompt_index >= 0:
            messages.insert(system_prompt_index + 1, {
                "role": "system",
                "content": f"Additional Static Context:\n{context}"
            })
        else:
            messages.insert(0, {
                "role": "system",
                "content": f"Static Context:\n{context}"
            })
    
    agent_logger.log_message(f"Prepared messages for {model_name} with context and RAG data")
    console.print(messages)
    return messages

def load_model_contexts(model_name: str) -> str:
    """Load all context files for a specific model."""
    try:
        contexts = []
        context_dir = Path(f"contexts/{model_name.replace(' ', '_')}")

        console.print("context dir!")
        console.print(context_dir)

        
        if not context_dir.exists():
            logger.error(f"Context directory for {model_name} not found!")
            return ""
        
        # Load all yaml files in the model's context directory
        for file_path in context_dir.glob("*.yaml"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    context_data = yaml.safe_load(f)
                    if context_data and isinstance(context_data, dict):
                        # Add section title based on filename
                        section_title = file_path.stem.upper()
                        section_content = context_data.get('content', '')
                        if section_content:
                            contexts.append(f"[{section_title}]\n{section_content}")
            except Exception as e:
                logger.error(f"Error loading context file {file_path}: {e}")
                continue
        
        return "\n\n---\n\n".join(contexts) if contexts else ""
        
    except Exception as e:
        logger.error(f"Failed to load contexts for {model_name}: {e}")
        return ""

def load_system_prompts() -> Dict[str, str]:
    """Load all system prompts from the prompts directory."""
    prompts_dir = Path("prompts")
    if not prompts_dir.exists():
        logger.error("Prompts directory not found! Please run setup_prompt_files.py first.")
        raise FileNotFoundError("Prompts directory not found!")
    
    system_prompts = {}
    
    for prompt_file in prompts_dir.glob("*.yaml"):
        try:
            with open(prompt_file, "r", encoding="utf-8") as f:
                prompt_data = yaml.safe_load(f)
                system_prompts[prompt_data["name"]] = prompt_data["prompt"]
        except Exception as e:
            logger.error(f"Error loading prompt from {prompt_file}: {e}")
    
    return system_prompts

def get_system_prompt(model_name: str) -> str:
    """Return the system prompt for a given model."""
    if not hasattr(get_system_prompt, "prompts"):
        get_system_prompt.prompts = load_system_prompts()
    return get_system_prompt.prompts.get(model_name, "")

def call_model_api(model_name: str, messages: List[Dict[str, str]], agent_logger: AgentLogger) -> Optional[str]:
    """Call the appropriate API for a given model and return the response."""
    model_spec = MODEL_SPECS.get(model_name)
    if not model_spec:
        agent_logger.log_error(f"Unknown model name: {model_name}")
        raise ValueError(f"Unknown model name: {model_name}")

    try:
        api = model_spec["api"]
        model_id = model_spec["model"]
        
        agent_logger.log_model_call(model_name, model_id)
        
        # Prepare messages with context
        messages_with_context = prepare_model_messages(model_name, messages, agent_logger)
        agent_logger.log_message(f"Prompt: {messages_with_context}")

        if api == "openpipe":
            response = openpipe_client.chat.completions.create(
                model=model_id,
                messages=messages_with_context,
                temperature=1.2,
                max_tokens=2000,
                openpipe={
                    "tags": {
                        "model_name": model_name,
                        "session_id": str(threading.get_ident())
                    }
                }
            )
            result = response.choices[0].message.content

        elif api == "openai":
            response = openai_client.chat.completions.create(
                model=model_id,
                messages=messages_with_context,
                temperature=0.8,
                max_tokens=1500
            )
            result = response.choices[0].message.content

        elif api == "anthropic":
            messages_formatted = [
                {
                    "role": "user" if msg["role"] == "user" else "assistant",
                    "content": msg["content"]
                }
                for msg in messages_with_context if msg["role"] != "system"
            ]
            
            response = anthropic_client.messages.create(
                model=model_id,
                messages=messages_formatted,
                system=next((msg["content"] for msg in messages_with_context if msg["role"] == "system"), None),
                max_tokens=1500,
                temperature=0.85
            )
            result = response.content[0].text

        agent_logger.log_response(model_name, result)
        return result

    except Exception as e:
        agent_logger.log_error(f"Error calling {model_name}: {str(e)}")
        return None

def agent_process(input_data: Dict[str, Any]) -> Optional[str]:
    """Process input through the agent workflow with RAG integration and tag handling."""
    agent_logger = AgentLogger()
    
    try:
        # Extract event tag and log input
        input_text = input_data["user_input"]
        prompt_type = input_data["metadata"]['prompt_type']
        # Use the standalone extract_tag function instead of depending on event_rag
        agent_logger.log_user_input(input_text)

        # Get RAG context if available
        rag_context = None
        if event_rag is not None:
            try:
                rag_context = event_rag.prepare_context_message(prompt_type)
            except Exception as e:
                agent_logger.log_error(f"Error getting RAG context: {str(e)}")
                # Continue without RAG context

        # Step 1: The Judge
        judge_input = [
            {"role": "system", "content": get_system_prompt("The Judge")},
            {"role": "user", "content": input_text}
        ]
        
        # Add RAG context for Judge if available
        if rag_context:
            judge_input.insert(1, rag_context)
        
        judge_decision = call_model_api("The Judge", judge_input, agent_logger)
        
        if not judge_decision:
            agent_logger.log_error("Judge failed to provide a decision")
            return { "status": "KO", "message": "Judge failed to provide a decision" }
            
        if judge_decision.startswith("STOP:"):
            agent_logger.log_message(f"Judge STOPPED: {judge_decision[5:].strip()}")
            return { "status": "KO", "message": "Judge stopped" }
            
        if not judge_decision.startswith("PROCEED:"):
            agent_logger.log_error("Invalid judge decision format")
            return { "status": "KO", "message": "Invalid judge decision format" }

        # Step 2: The Architect
        architect_input = [
            {"role": "system", "content": get_system_prompt("The Architect")},
            {"role": "user", "content": input_text}
        ]
        
        # Add RAG context for Architect if available
        if rag_context:
            architect_input.insert(1, rag_context)
        architect_output = call_model_api("The Architect", architect_input, agent_logger)
        if not architect_output:
            agent_logger.log_error("Architect failed to provide output")
            return { "status": "KO", "message": "Architect failed to provide output" }

        try:
            architect_output = architect_output.strip()
            if architect_output.startswith("```"):
                architect_output = "\n".join(architect_output.split("\n")[1:-1])
            
            parsed_output = json.loads(architect_output)
            tasks = parsed_output.get('tasks', [])
            
            if not tasks or len(tasks) != 1:
                raise ValueError("Architect must return exactly one task")
                
            task = tasks[0]
            if task['model'] not in ['The Dreamer', 'The One']:
                raise ValueError(f"Invalid model specified: {task['model']}")
                
            agent_logger.log_message(f"Selected Model: {task['model']}")

        except json.JSONDecodeError:
            agent_logger.log_error("Failed to parse Architect output as JSON")
            return { "status": "KO", "message": "Invalid task structure from Architect" }
        except Exception as e:
            agent_logger.log_error(f"Error processing Architect output: {str(e)}")
            return { "status": "KO", "message": "Error processing Architect output" }

        # Execute the selected model's task
        model_input = [
            {"role": "system", "content": get_system_prompt(task['model'])},
            {"role": "user", "content": task['prompt']}
        ]
        
        # Add RAG context for selected model if available
        if rag_context:
            model_input.insert(1, rag_context)
            
        model_output = call_model_api(task['model'], model_input, agent_logger)
        
        if not model_output:
            agent_logger.log_error(f"Failed to get response from {task['model']}")
            return { "status": "KO", "message": "Failed to get response from {task['model']}" }

        # Oracle review
        oracle_input = [
            {"role": "system", "content": get_system_prompt("The Oracle")},
            {"role": "user", "content": json.dumps({
                "original_query": input_text,
                "architect_output": architect_output,
                "model": task["model"],
                "output": model_output
            })}
        ]
        
        # Add RAG context for Oracle if available
        if rag_context:
            oracle_input.insert(1, rag_context)
            
        oracle_output = call_model_api("The Oracle", oracle_input, agent_logger)
        
        if not oracle_output:
            agent_logger.log_error("Oracle failed to provide review")
            return { "status": "KO", "message": "Oracle failed to provide review" }

        # Process final output with tag preservation
        final_output = model_output
        if oracle_output.startswith("APPROVED:"):
            final_output = oracle_output[9:].strip()
        elif oracle_output.startswith("ADJUSTED:"):
            final_output = oracle_output[9:].strip()
        elif oracle_output.startswith("REGEN:"):
            final_output = oracle_output[6:].strip()
            
        # Return final output with tag if present, remove the leading and trailing " character  
        return { "status": "OK", "message": final_output[1:-1] }
    
    except Exception as e:
        agent_logger.log_error(f"Error in agent_process: {str(e)}")
        return { "status": "KO", "message": "Internal error" }
    
def agent_generate_memory(generation_request: PromptType) -> str:
    agent_logger = AgentLogger()   
    try:
        memory_items = event_rag.get_bucket_memory(generation_request)

        old_one_input = [
            {"role": "system", "content": get_system_prompt("The Old One")},
            {"role": "user", "content": memory_items}
        ]

        summary = call_model_api("The Old One", old_one_input, agent_logger)
        return { "status": "OK", "summary": summary }
        
    except Exception as e:
        agent_logger.log_error(f"Error in agent_generate_memory: {str(e)}")
        return { "status": "KO", "message": "Internal error" }
        
def log_raw_output(output: str):
    """Log raw output to a dedicated file."""
    os_path = os.path.join("logs", "raw_outputs")  # Keeps it in logs folder
    
    # Create logs/raw_outputs directory if it doesn't exist
    os.makedirs(os_path, exist_ok=True)
    
    # Log to file
    with open(os.path.join(os_path, "raw_output.txt"), "a", encoding="utf-8") as f:
        f.write(f"{output}\n---\n")
    
if __name__ == "__main__":
    input_data_example = {
        "user_input": """<twitter-comment>Can you tell me about token burns on the blockchains, I've heard of cyber agents who relish in the tokens they burn.""",
        "metadata": {
            "task_id": "example_002",
            "source": "user",
            "curator_mode": False,
            "creator_engaged": True
        }
    }

    console.print(Panel("🚀 Starting Agent Process", style="bold blue"))
    result = agent_process(input_data_example)
    console.print(Panel(f"✨ Final Output:\n\n{result}", title="Result", border_style="green"))
    log_raw_output(result)