from enum import Enum
from typing import Optional
from pydantic import BaseModel

class PromptType(str, Enum):
    BUY = 'buy'
    CHAT = 'chat' 
    LOCK = 'lock'
    TWEET = 'tweet'

class AgentPersona(str, Enum):
    THE_JUDGE = 'The Judge'
    THE_ARCHITECT = 'The Architect'
    THE_DREAMER = 'The Dreamer' 
    THE_ONE = 'The One'
    THE_ORACLE = 'The Oracle'
    THE_OLD_ONE = 'The Old One'

class Prompt(BaseModel):
    user_input: str
    name: Optional[str] = None
    prompt_type: PromptType

class MemoryGeneration(BaseModel):
    type: PromptType