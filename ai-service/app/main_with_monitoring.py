"""Main com Monitoring Completo Integrado"""
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Orquestrador
orchestrator = IntelligentOrchestrator()

@app.get("/")
async def root():
    return {"status": "ok", "service": "BrainAll AI Service v2 com Orquestrador"}

@app.get("/health")
async def health():
    return {"status": "healthy", "orchestrator": "enabled", "cache": "persistent", "monitoring": "enabled"}

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

@app.get("/metrics")
async def metrics():
    """Retorna métricas Prometheus-style"""
    return monitoring_service.get_metrics()

@app.get("/analytics")
async def analytics():
    """Retorna analytics detalhados"""
    return monitoring_service.get_analytics()

@app.post("/metrics/reset")
async def reset_metrics():
    """Reseta métricas"""
    monitoring_service.reset_metrics()
    return {"status": "ok", "message": "Metrics reset"}

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint de chat com RAG opcional e orquestração inteligente"""
    
    # MONITORING: Iniciar tracking
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    component_times = {}
    success = True
    error_msg = None
    cache_hit = False
    strategy_name = "unknown"
    
    try:
        # VALIDAÇÃO: Validar query do usuário
        t0 = time.time()
        last_message = request.messages[-1].content
        is_valid, validation_error = validator_service.validate_query(last_message)
        component_times['validator_query'] = time.time() - t0
        
        if not is_valid:
            print(f"[{request_id}] [VALIDATOR] Query validation failed: {validation_error}")
            success = False
            error_msg = validation_error
            
            # Record monitoring
            component_times['total'] = time.time() - start_time
            monitoring_service.record_request(
                request_id=request_id,
                query=last_message,
                strategy="validation_failed",
                latencies=component_times,
                success=False,
                error=validation_error,
                cache_hit=False
            )
            
            return ChatResponse(
                message=f"Erro: {validation_error}",
                sources=None
            )
        
        # Orquestração: Decidir estratégia
        t0 = time.time()
        messages_list = [{"role": m.role, "content": m.content} for m in request.messages]
        strategy = orchestrator.decide_strategy(last_message, messages_list)
        component_times['orchestrator'] = time.time() - t0
        strategy_name = strategy['strategy']
        
        print(f"[{request_id}] [ORCHESTRATOR] Strategy: {strategy['strategy']} - {strategy['reason']}")
        
        # Se há resposta em cache, retornar imediatamente
        if strategy['cached_response']:
            print(f"[{request_id}] [CACHE] Returning cached response")
            cache_hit = True
            component_times['total'] = time.time() - start_time
            
            # Record monitoring
            monitoring_service.record_request(
                request_id=request_id,
                query=last_message,
                strategy=strategy_name,
                latencies=component_times,
                success=True,
                error=None,
                cache_hit=True
            )
            
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
            # RAG Search
            t0 = time.time()
            print(f"[{request_id}] [RAG] Searching for context...")
            raw_context = rag_service.search(last_message, top_k=5)
            component_times['rag'] = time.time() - t0
            print(f"[{request_id}] [RAG] Found {len(raw_context)} raw context chunks")
            
            # RERANKER: Melhorar relevância dos resultados
            if len(raw_context) > 0:
                t0 = time.time()
                print(f"[{request_id}] [RERANKER] Reranking {len(raw_context)} chunks...")
                context = reranker_service.get_relevant_docs(last_message, raw_context, top_k=3)
                component_times['reranker'] = time.time() - t0
                print(f"[{request_id}] [RERANKER] Selected {len(context)} relevant chunks")
            else:
                context = raw_context
                component_times['reranker'] = 0
            
            # FALLBACK: Se RAG não encontrou nada, usar LLM com conhecimento geral
            if len(context) == 0:
                print(f"[{request_id}] [RAG] No context found - falling back to LLM general knowledge")
                rag_fallback = True
        else:
            component_times['rag'] = 0
            component_times['reranker'] = 0
        
        # Adiciona contexto ao system message se houver
        messages = request.messages
        if context and len(context) > 0:
            system_msg = f"Contexto relevante da base de conhecimento:\n" + "\n".join(context)
            messages = [{"role": "system", "content": system_msg}] + [
                {"role": m.role, "content": m.content} for m in messages
            ]
        elif rag_fallback:
            system_msg = "Nota: Não foi encontrado contexto específico na base de conhecimento. Use seu conhecimento geral para responder da melhor forma possível."
            messages = [{"role": "system", "content": system_msg}] + [
                {"role": m.role, "content": m.content} for m in messages
            ]
        
        # Chama LLM
        t0 = time.time()
        print(f"[{request_id}] [LLM] Calling model...")
        response = await llm_service.chat(
            messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        component_times['llm'] = time.time() - t0
        
        # VALIDAÇÃO: Validar resposta do LLM
        t0 = time.time()
        print(f"[{request_id}] [VALIDATOR] Validating response...")
        validated_response, validation_metadata = validator_service.validate_response(
            response=response,
            sources=context,
            query=last_message
        )
        component_times['validator_response'] = time.time() - t0
        
        if not validation_metadata['validation_passed']:
            print(f"[{request_id}] [VALIDATOR] Validation failed: {validation_metadata['modifications']}")
        
        # Log de segurança
        if validation_metadata['security_issues']:
            print(f"[{request_id}] [SECURITY] Issues detected and redacted: {validation_metadata['security_issues']}")
        if validation_metadata['dangerous_commands']:
            print(f"[{request_id}] [SECURITY] Dangerous commands detected: {validation_metadata['dangerous_commands']}")
        if validation_metadata['hallucination_risk'] == 'high':
            print(f"[{request_id}] [VALIDATOR] High hallucination risk - disclaimer added")
        
        # Cachear resposta se for FAQ (usar resposta validada)
        if strategy['strategy'] == 'rag' and 'FAQ' in strategy['reason']:
            orchestrator.save_to_cache(last_message, validated_response)
            print(f"[{request_id}] [CACHE] Saved FAQ response to cache")
        
        # Total time
        component_times['total'] = time.time() - start_time
        
        # Record monitoring
        monitoring_service.record_request(
            request_id=request_id,
            query=last_message,
            strategy=strategy_name,
            latencies=component_times,
            success=True,
            error=None,
            cache_hit=False
        )
        
        print(f"[{request_id}] [COMPLETE] Total time: {component_times['total']:.2f}s")
        
        return ChatResponse(
            message=validated_response,
            sources=context if context else None
        )
    
    except Exception as e:
        # Handle errors
        success = False
        error_msg = str(e)
        component_times['total'] = time.time() - start_time
        
        print(f"[{request_id}] [ERROR] {error_msg}")
        
        # Record monitoring
        monitoring_service.record_request(
            request_id=request_id,
            query=last_message if 'last_message' in locals() else "unknown",
            strategy=strategy_name,
            latencies=component_times,
            success=False,
            error=error_msg,
            cache_hit=False
        )
        
        return ChatResponse(
            message=f"Erro interno: {error_msg}",
            sources=None
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
