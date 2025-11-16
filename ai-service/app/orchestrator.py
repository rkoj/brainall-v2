"""
Orquestrador Inteligente para BrainAll V2
Decide quando usar RAG, cache ou resposta direta
"""

from typing import List, Dict, Optional, Tuple
import hashlib
import json
from datetime import datetime, timedelta
from app.services.cache_service import cache_service

class IntelligentOrchestrator:
    """
    Orquestrador que decide a melhor estratégia para cada query
    """
    
    def __init__(self):
        # Keywords que indicam necessidade de RAG
        self.rag_keywords = [
            # Técnico
            "proxmox", "kubernetes", "k8s", "docker", "vllm", "qwen",
            "asterisk", "webrtc", "sip", "voip", "cati",
            # Comandos
            "comando", "configurar", "instalar", "setup", "deploy",
            # Arquitetura
            "arquitetura", "componente", "sistema", "infraestrutura",
            # Troubleshooting
            "erro", "problema", "debug", "corrigir", "resolver",
            # BrainAll específico
            "brainall", "underall", "underphone",
        ]
        
        # Keywords que indicam perguntas simples (sem RAG)
        self.simple_keywords = [
            "olá", "oi", "bom dia", "boa tarde", "boa noite",
            "como estás", "tudo bem", "obrigado", "obrigada",
            "tchau", "adeus", "até logo",
        ]
        
        # Cache persistente (SQLite)
        self.cache = cache_service
        
        # Limpar cache expirado na inicialização
        self.cache.clear_expired()
        self.cache_ttl = timedelta(hours=24)
        
    def _normalize_query(self, query: str) -> str:
        """Normaliza query para comparação"""
        return query.lower().strip()
    
    def _get_cache_key(self, query: str) -> str:
        """Gera chave de cache para a query"""
        normalized = self._normalize_query(query)
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def _check_cache(self, query: str) -> Optional[str]:
        """Verifica se há resposta em cache (SQLite)"""
        return self.cache.get(query)
    
    def _save_to_cache(self, query: str, response: str):
        """Guarda resposta em cache (SQLite)"""
        self.cache.set(query, response)
    
    def _should_use_rag(self, query: str) -> bool:
        """Decide se deve usar RAG baseado na query"""
        normalized = self._normalize_query(query)
        
        # Verificar se é pergunta simples
        for keyword in self.simple_keywords:
            if keyword in normalized:
                return False
        
        # Verificar se contém keywords técnicas
        for keyword in self.rag_keywords:
            if keyword in normalized:
                return True
        
        # Heurística: perguntas longas (>50 chars) provavelmente precisam de RAG
        if len(query) > 50:
            return True
        
        # Perguntas com "?" provavelmente precisam de RAG
        if "?" in query and len(query) > 20:
            return True
        
        return False
    
    def _is_faq(self, query: str) -> bool:
        """Verifica se é uma FAQ comum"""
        normalized = self._normalize_query(query)
        
        faqs = [
            "o que é o brainall",
            "como funciona",
            "o que podes fazer",
            "quem és tu",
            "qual é o teu nome",
            "que modelos usas",
        ]
        
        for faq in faqs:
            if faq in normalized:
                return True
        
        return False
    
    def decide_strategy(self, query: str, history: List[Dict]) -> Dict:
        """
        Decide a melhor estratégia para responder à query
        
        Returns:
            {
                "strategy": "cache" | "rag" | "direct",
                "use_rag": bool,
                "cached_response": str | None,
                "reason": str
            }
        """
        
        # 1. Verificar cache primeiro
        cached = self._check_cache(query)
        if cached:
            return {
                "strategy": "cache",
                "use_rag": False,
                "cached_response": cached,
                "reason": "Resposta encontrada em cache"
            }
        
        # 2. Verificar se é FAQ
        if self._is_faq(query):
            return {
                "strategy": "rag",
                "use_rag": True,
                "cached_response": None,
                "reason": "FAQ - usar RAG para resposta completa"
            }
        
        # 3. Decidir se precisa de RAG
        needs_rag = self._should_use_rag(query)
        
        if needs_rag:
            return {
                "strategy": "rag",
                "use_rag": True,
                "cached_response": None,
                "reason": "Query técnica - usar RAG"
            }
        else:
            return {
                "strategy": "direct",
                "use_rag": False,
                "cached_response": None,
                "reason": "Query simples - resposta direta"
            }
    
    def save_to_cache(self, query: str, response: str):
        """
        Guarda resposta em cache (método público)
        """
        self._save_to_cache(query, response)
    
    def save_response(self, query: str, response: str, strategy: str):
        """
        Guarda resposta em cache se apropriado
        """
        # Só guardar em cache se foi FAQ ou query técnica comum
        if strategy in ["rag"] and self._is_faq(query):
            self._save_to_cache(query, response)
    
    def get_cache_stats(self) -> Dict:
        """Retorna estatísticas do cache"""
        total = len(self.response_cache)
        valid = sum(
            1 for _, (_, ts) in self.response_cache.items()
            if datetime.now() - ts < self.cache_ttl
        )
        
        return {
            "total_cached": total,
            "valid_cached": valid,
            "expired": total - valid
        }
