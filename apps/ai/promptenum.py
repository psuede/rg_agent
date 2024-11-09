from enum import Enum

class PromptType(str, Enum):
    BUY = 'buy'
    CHAT = 'chat' 
    LOCK = 'lock'
    TWEET = 'Tweet'