from enum import Enum
from pydantic import BaseModel

class PromptType(str, Enum):
    BUY = 'buy'
    CHAT = 'chat' 
    LOCK = 'lock'
    TWEET = 'tweet'

class Prompt(BaseModel):
    user_input: str
    prompt_type: PromptType

class MemoryGeneration(BaseModel):
    type: PromptType