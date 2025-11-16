"""Serviço RAG com ChromaDB"""
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings

class RAGService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection("brainall_docs")
    
    def add_documents(self, documents, metadatas, ids):
        """Adiciona documentos ao vector DB"""
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
    
    def search(self, query, top_k=3):
        """Busca documentos relevantes"""
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )
        return results["documents"][0] if results["documents"] else []

rag_service = RAGService()
