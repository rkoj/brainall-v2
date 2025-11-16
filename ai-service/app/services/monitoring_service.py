"""Serviço de Monitoring e Analytics"""
import time
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict, deque
import threading

logger = logging.getLogger(__name__)

class MonitoringService:
    """
    Serviço de monitoring com métricas em tempo real
    """
    
    def __init__(self, window_minutes: int = 60):
        """
        Inicializa monitoring
        
        Args:
            window_minutes: Janela de tempo para métricas (minutos)
        """
        self.window_minutes = window_minutes
        self.lock = threading.Lock()
        
        # Métricas de requests
        self.requests: deque = deque(maxlen=1000)  # Últimos 1000 requests
        
        # Contadores
        self.total_requests = 0
        self.total_errors = 0
        self.cache_hits = 0
        self.cache_misses = 0
        
        # Latências por componente (últimos 100)
        self.latencies = {
            'orchestrator': deque(maxlen=100),
            'rag': deque(maxlen=100),
            'reranker': deque(maxlen=100),
            'llm': deque(maxlen=100),
            'validator': deque(maxlen=100),
            'total': deque(maxlen=100)
        }
        
        # Estratégias usadas
        self.strategy_counts = defaultdict(int)
        
        # Erros por tipo
        self.error_types = defaultdict(int)
        
        logger.info(f"MonitoringService initialized (window: {window_minutes}min)")
    
    def record_request(
        self,
        request_id: str,
        query: str,
        strategy: str,
        latencies: Dict[str, float],
        success: bool,
        error: Optional[str] = None,
        cache_hit: bool = False
    ):
        """
        Registra um request completo
        
        Args:
            request_id: ID único do request
            query: Query do usuário
            strategy: Estratégia usada
            latencies: Dict com latências de cada componente
            success: Se request foi bem-sucedido
            error: Mensagem de erro (se houver)
            cache_hit: Se foi cache hit
        """
        with self.lock:
            # Incrementar contadores
            self.total_requests += 1
            
            if not success:
                self.total_errors += 1
                if error:
                    self.error_types[error] += 1
            
            if cache_hit:
                self.cache_hits += 1
            else:
                self.cache_misses += 1
            
            # Registrar estratégia
            self.strategy_counts[strategy] += 1
            
            # Registrar latências
            for component, latency in latencies.items():
                if component in self.latencies:
                    self.latencies[component].append(latency)
            
            # Registrar request completo
            self.requests.append({
                'request_id': request_id,
                'timestamp': datetime.now().isoformat(),
                'query_length': len(query),
                'strategy': strategy,
                'latency_total': latencies.get('total', 0),
                'success': success,
                'cache_hit': cache_hit,
                'error': error
            })
    
    def get_metrics(self) -> Dict:
        """
        Retorna métricas em formato Prometheus-style
        """
        with self.lock:
            # Calcular médias de latência
            avg_latencies = {}
            for component, values in self.latencies.items():
                if values:
                    avg_latencies[f'{component}_latency_avg'] = sum(values) / len(values)
                    avg_latencies[f'{component}_latency_p95'] = sorted(values)[int(len(values) * 0.95)] if len(values) > 0 else 0
                else:
                    avg_latencies[f'{component}_latency_avg'] = 0
                    avg_latencies[f'{component}_latency_p95'] = 0
            
            # Calcular throughput (requests/min)
            recent_requests = [
                r for r in self.requests 
                if datetime.fromisoformat(r['timestamp']) > datetime.now() - timedelta(minutes=self.window_minutes)
            ]
            throughput = len(recent_requests) / self.window_minutes if self.window_minutes > 0 else 0
            
            # Cache hit rate
            total_cache_ops = self.cache_hits + self.cache_misses
            cache_hit_rate = (self.cache_hits / total_cache_ops * 100) if total_cache_ops > 0 else 0
            
            # Error rate
            error_rate = (self.total_errors / self.total_requests * 100) if self.total_requests > 0 else 0
            
            return {
                # Contadores
                'total_requests': self.total_requests,
                'total_errors': self.total_errors,
                'cache_hits': self.cache_hits,
                'cache_misses': self.cache_misses,
                
                # Rates
                'throughput_rpm': round(throughput, 2),
                'cache_hit_rate_pct': round(cache_hit_rate, 2),
                'error_rate_pct': round(error_rate, 2),
                
                # Latências
                **avg_latencies,
                
                # Estratégias
                'strategies': dict(self.strategy_counts),
                
                # Erros
                'error_types': dict(self.error_types)
            }
    
    def get_analytics(self) -> Dict:
        """
        Retorna analytics detalhados
        """
        with self.lock:
            # Requests recentes
            recent_requests = [
                r for r in self.requests 
                if datetime.fromisoformat(r['timestamp']) > datetime.now() - timedelta(minutes=self.window_minutes)
            ]
            
            # Análise por estratégia
            strategy_stats = defaultdict(lambda: {'count': 0, 'avg_latency': 0, 'success_rate': 0})
            for req in recent_requests:
                strategy = req['strategy']
                strategy_stats[strategy]['count'] += 1
                strategy_stats[strategy]['avg_latency'] += req['latency_total']
                if req['success']:
                    strategy_stats[strategy]['success_rate'] += 1
            
            # Calcular médias
            for strategy, stats in strategy_stats.items():
                if stats['count'] > 0:
                    stats['avg_latency'] /= stats['count']
                    stats['success_rate'] = (stats['success_rate'] / stats['count']) * 100
            
            # Top 10 queries mais lentas
            slowest_queries = sorted(
                recent_requests,
                key=lambda x: x['latency_total'],
                reverse=True
            )[:10]
            
            # Distribuição de latência
            all_latencies = [r['latency_total'] for r in recent_requests]
            latency_distribution = {
                'p50': sorted(all_latencies)[int(len(all_latencies) * 0.5)] if all_latencies else 0,
                'p75': sorted(all_latencies)[int(len(all_latencies) * 0.75)] if all_latencies else 0,
                'p90': sorted(all_latencies)[int(len(all_latencies) * 0.90)] if all_latencies else 0,
                'p95': sorted(all_latencies)[int(len(all_latencies) * 0.95)] if all_latencies else 0,
                'p99': sorted(all_latencies)[int(len(all_latencies) * 0.99)] if all_latencies else 0,
            }
            
            return {
                'window_minutes': self.window_minutes,
                'recent_requests_count': len(recent_requests),
                'strategy_stats': dict(strategy_stats),
                'slowest_queries': slowest_queries,
                'latency_distribution': latency_distribution,
                'cache_efficiency': {
                    'hits': self.cache_hits,
                    'misses': self.cache_misses,
                    'hit_rate_pct': round((self.cache_hits / (self.cache_hits + self.cache_misses) * 100), 2) if (self.cache_hits + self.cache_misses) > 0 else 0
                }
            }
    
    def reset_metrics(self):
        """Reseta todas as métricas"""
        with self.lock:
            self.requests.clear()
            self.total_requests = 0
            self.total_errors = 0
            self.cache_hits = 0
            self.cache_misses = 0
            
            for component in self.latencies:
                self.latencies[component].clear()
            
            self.strategy_counts.clear()
            self.error_types.clear()
            
            logger.info("Metrics reset")

# Instância global
monitoring_service = MonitoringService()
