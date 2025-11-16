"""Serviço de Reranking para melhorar relevância dos resultados RAG"""
from typing import List, Tuple
from sentence_transformers import CrossEncoder
import logging

logger = logging.getLogger(__name__)

class RerankerService:
    """
    Reranker usando Cross-Encoder para melhorar relevância dos resultados RAG
    """
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2", threshold: float = 0.45):
        """
        Inicializa o reranker
        
        Args:
            model_name: Nome do modelo cross-encoder
            threshold: Score mínimo para considerar resultado relevante (0-1)
        """
        self.threshold = threshold
        logger.info(f"Loading reranker model: {model_name}")
        try:
            self.model = CrossEncoder(model_name)
            logger.info(f"Reranker model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load reranker model: {e}")
            self.model = None
    
    def rerank(self, query: str, documents: List[str], top_k: int = 3) -> List[Tuple[str, float]]:
        """
        Reordena documentos por relevância usando cross-encoder
        
        Args:
            query: Query do usuário
            documents: Lista de documentos para reranking
            top_k: Número máximo de documentos a retornar
            
        Returns:
            Lista de tuplas (documento, score) ordenada por relevância
        """
        if not documents:
            return []
        
        if self.model is None:
            logger.warning("Reranker model not available, returning original documents")
            return [(doc, 1.0) for doc in documents[:top_k]]
        
        try:
            # Preparar pares (query, documento) para o cross-encoder
            pairs = [[query, doc] for doc in documents]
            
            # Calcular scores de relevância
            scores = self.model.predict(pairs)
            
            # Combinar documentos com scores
            doc_scores = list(zip(documents, scores))
            
            # Filtrar por threshold
            filtered = [(doc, float(score)) for doc, score in doc_scores if score >= self.threshold]
            
            # Ordenar por score (maior primeiro)
            ranked = sorted(filtered, key=lambda x: x[1], reverse=True)
            
            # Retornar top_k
            result = ranked[:top_k]
            
            logger.info(f"Reranked {len(documents)} docs -> {len(filtered)} passed threshold -> returning top {len(result)}")
            for i, (doc, score) in enumerate(result):
                logger.debug(f"  {i+1}. Score: {score:.3f} | Preview: {doc[:100]}...")
            
            return result
            
        except Exception as e:
            logger.error(f"Reranking failed: {e}")
            # Fallback: retornar documentos originais
            return [(doc, 1.0) for doc in documents[:top_k]]
    
    def get_relevant_docs(self, query: str, documents: List[str], top_k: int = 3) -> List[str]:
        """
        Retorna apenas os documentos relevantes (sem scores)
        
        Args:
            query: Query do usuário
            documents: Lista de documentos
            top_k: Número máximo de documentos
            
        Returns:
            Lista de documentos relevantes
        """
        ranked = self.rerank(query, documents, top_k)
        return [doc for doc, score in ranked]
    
    def set_threshold(self, threshold: float):
        """Atualiza o threshold de relevância"""
        self.threshold = threshold
        logger.info(f"Reranker threshold updated to {threshold}")

# Instância global do reranker
reranker_service = RerankerService()
