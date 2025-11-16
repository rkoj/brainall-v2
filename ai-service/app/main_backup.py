"""FastAPI Application com Orquestrador Inteligente"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.chat import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service
from app.services.reranker_service import reranker_service
from app.services.validator_service import validator_service
from app.services.monitoring_service import monitoring_service
from app.orchestrator import IntelligentOrchestrator
import uuid
import time

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION
)

# Inicializar orquestrador
orchestrator = IntelligentOrchestrator()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "service": "BrainAll AI Service v2 com Orquestrador"}

@app.get("/health")
async def health():
    return {"status": "healthy", "orchestrator": "enabled", "cache": "persistent"}

@app.get("/cache/stats")
async def cache_stats():
    """Retorna estatísticas do cache"""
    from app.services.cache_service import cache_service
    return cache_service.get_stats()

@app.post("/cache/clear")
async def cache_clear():
    """Limpa todo o cache"""
    from app.services.cache_service import cache_service
    deleted = cache_service.clear_all()
    return {"status": "ok", "deleted": deleted}

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint de chat com RAG opcional e orquestração inteligente"""
    
    # MONITORING: Iniciar tracking
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    latencies = {}
    success = True
    error_msg = None
    cache_hit = False
    
    try:
        # VALIDAÇÃO: Validar query do usuário
        last_message = request.messages[-1].content
    is_valid, error_msg = validator_service.validate_query(last_message)
    if not is_valid:
        print(f"[VALIDATOR] Query validation failed: {error_msg}")
        return ChatResponse(
            message=f"Erro: {error_msg}",
            sources=None
        )
    
    # Orquestração: Decidir estratégia
    messages_list = [{"role": m.role, "content": m.content} for m in request.messages]
    strategy = orchestrator.decide_strategy(last_message, messages_list)
    
    print(f"[ORCHESTRATOR] Strategy: {strategy['strategy']} - {strategy['reason']}")
    
    # Se há resposta em cache, retornar imediatamente
    if strategy['cached_response']:
        print(f"[CACHE] Returning cached response")
        return ChatResponse(
            message=strategy['cached_response'],
            sources=["cache"]
        )
    
    # Decidir se usa RAG baseado na estratégia
    use_rag_decision = strategy['use_rag'] if request.use_rag else False
    
    # Se RAG ativado, busca contexto
    context = []
    rag_fallback = False
    
    if use_rag_decision and len(request.messages) > 0:
        print(f"[RAG] Searching for context...")
        raw_context = rag_service.search(last_message, top_k=5)  # Buscar mais para reranking
        print(f"[RAG] Found {len(raw_context)} raw context chunks")
        
        # RERANKER: Melhorar relevância dos resultados
        if len(raw_context) > 0:
            print(f"[RERANKER] Reranking {len(raw_context)} chunks...")
            context = reranker_service.get_relevant_docs(last_message, raw_context, top_k=3)
            print(f"[RERANKER] Selected {len(context)} relevant chunks")
        else:
            context = raw_context
        
        # FALLBACK: Se RAG não encontrou nada, usar LLM com conhecimento geral
        if len(context) == 0:
            print(f"[RAG] No context found - falling back to LLM general knowledge")
            rag_fallback = True
    
    # Adiciona contexto ao system message se houver
    messages = request.messages
    if context and len(context) > 0:
        system_msg = f"Contexto relevante da base de conhecimento:\n" + "\n".join(context)
        messages = [{"role": "system", "content": system_msg}] + [
            {"role": m.role, "content": m.content} for m in messages
        ]
    elif rag_fallback:
        # Avisar o LLM que não há contexto específico, mas pode usar conhecimento geral
        system_msg = "Nota: Não foi encontrado contexto específico na base de conhecimento. Use seu conhecimento geral para responder da melhor forma possível."
        messages = [{"role": "system", "content": system_msg}] + [
            {"role": m.role, "content": m.content} for m in messages
        ]
    
    # Chama LLM
    print(f"[LLM] Calling model...")
    response = await llm_service.chat(
        messages,
        max_tokens=request.max_tokens,
        temperature=request.temperature
    )
    
    # VALIDAÇÃO: Validar resposta do LLM
    print(f"[VALIDATOR] Validating response...")
    validated_response, validation_metadata = validator_service.validate_response(
        response=response,
        sources=context,
        query=last_message
    )
    
    if not validation_metadata['validation_passed']:
        print(f"[VALIDATOR] Validation failed: {validation_metadata['modifications']}")
    
    # Log de segurança
    if validation_metadata['security_issues']:
        print(f"[SECURITY] Issues detected and redacted: {validation_metadata['security_issues']}")
    if validation_metadata['dangerous_commands']:
        print(f"[SECURITY] Dangerous commands detected: {validation_metadata['dangerous_commands']}")
    if validation_metadata['hallucination_risk'] == 'high':
        print(f"[VALIDATOR] High hallucination risk - disclaimer added")
    
    # Cachear resposta se for FAQ (usar resposta validada)
    if strategy['strategy'] == 'rag' and 'FAQ' in strategy['reason']:
        orchestrator.save_to_cache(last_message, validated_response)
        print(f"[CACHE] Saved FAQ response to cache")
    
    return ChatResponse(
        message=validated_response,
        sources=context if context else None
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
