"""Serviço de integração com vLLM"""
from openai import OpenAI
from app.config import settings

class LLMService:
    def __init__(self):
        self.client = OpenAI(
            base_url=settings.VLLM_BASE_URL,
            api_key=settings.VLLM_API_KEY
        )
    
    async def chat(self, messages, max_tokens=2048, temperature=0.7):
        # Converter mensagens para formato dict se necessário
        formatted_messages = []
        for m in messages:
            if isinstance(m, dict):
                formatted_messages.append(m)
            else:
                formatted_messages.append({"role": m.role, "content": m.content})
        
        response = self.client.chat.completions.create(
            model=settings.VLLM_MODEL,
            messages=formatted_messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return response.choices[0].message.content

llm_service = LLMService()
