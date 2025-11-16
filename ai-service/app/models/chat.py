"""Modelos de dados para chat"""
from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    max_tokens: Optional[int] = 2048
    temperature: Optional[float] = 0.7
    use_rag: Optional[bool] = True

class ChatResponse(BaseModel):
    message: str
    sources: Optional[List[str]] = None
