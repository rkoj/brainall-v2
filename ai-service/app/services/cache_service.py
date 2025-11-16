"""Serviço de Cache Persistente com SQLite"""
import sqlite3
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
from pathlib import Path

logger = logging.getLogger(__name__)

class CacheService:
    """
    Cache persistente usando SQLite
    """
    
    def __init__(self, db_path: str = "/home/ubuntu/brainall-ai-service/data/cache.db", ttl_hours: int = 24):
        """
        Inicializa o cache
        
        Args:
            db_path: Caminho para o arquivo SQLite
            ttl_hours: Time-to-live em horas
        """
        self.db_path = db_path
        self.ttl_hours = ttl_hours
        
        # Criar diretório se não existir
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Inicializar database
        self._init_db()
        
        logger.info(f"CacheService initialized: {db_path} (TTL: {ttl_hours}h)")
    
    def _init_db(self):
        """Cria tabela de cache se não existir"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                hits INTEGER DEFAULT 0
            )
        ''')
        
        # Índice para expiração
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_expires_at 
            ON cache(expires_at)
        ''')
        
        conn.commit()
        conn.close()
        
        logger.info("Cache database initialized")
    
    def _get_key(self, query: str) -> str:
        """Gera chave MD5 para query"""
        return hashlib.md5(query.lower().strip().encode()).hexdigest()
    
    def get(self, query: str) -> Optional[str]:
        """
        Busca resposta no cache
        
        Args:
            query: Query do usuário
            
        Returns:
            Resposta em cache ou None
        """
        key = self._get_key(query)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Buscar e verificar expiração
        cursor.execute('''
            SELECT value, expires_at, hits 
            FROM cache 
            WHERE key = ? AND expires_at > ?
        ''', (key, datetime.now()))
        
        result = cursor.fetchone()
        
        if result:
            value, expires_at, hits = result
            
            # Incrementar contador de hits
            cursor.execute('''
                UPDATE cache 
                SET hits = hits + 1 
                WHERE key = ?
            ''', (key,))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Cache HIT: {key[:8]}... (hits: {hits+1})")
            return value
        
        conn.close()
        logger.info(f"Cache MISS: {key[:8]}...")
        return None
    
    def set(self, query: str, response: str):
        """
        Salva resposta no cache
        
        Args:
            query: Query do usuário
            response: Resposta do LLM
        """
        key = self._get_key(query)
        now = datetime.now()
        expires_at = now + timedelta(hours=self.ttl_hours)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert or replace
        cursor.execute('''
            INSERT OR REPLACE INTO cache (key, value, created_at, expires_at, hits)
            VALUES (?, ?, ?, ?, 0)
        ''', (key, response, now, expires_at))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Cache SET: {key[:8]}... (expires: {expires_at.strftime('%Y-%m-%d %H:%M')})")
    
    def delete(self, query: str) -> bool:
        """
        Remove entrada do cache
        
        Args:
            query: Query do usuário
            
        Returns:
            True se removido, False se não existia
        """
        key = self._get_key(query)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cache WHERE key = ?', (key,))
        deleted = cursor.rowcount > 0
        
        conn.commit()
        conn.close()
        
        if deleted:
            logger.info(f"Cache DELETE: {key[:8]}...")
        
        return deleted
    
    def clear_expired(self) -> int:
        """
        Remove entradas expiradas
        
        Returns:
            Número de entradas removidas
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cache WHERE expires_at < ?', (datetime.now(),))
        deleted = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        if deleted > 0:
            logger.info(f"Cache cleanup: {deleted} expired entries removed")
        
        return deleted
    
    def clear_all(self) -> int:
        """
        Limpa todo o cache
        
        Returns:
            Número de entradas removidas
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cache')
        deleted = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        logger.info(f"Cache cleared: {deleted} entries removed")
        return deleted
    
    def get_stats(self) -> Dict:
        """
        Retorna estatísticas do cache
        
        Returns:
            Dict com estatísticas
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total entries
        cursor.execute('SELECT COUNT(*) FROM cache')
        total = cursor.fetchone()[0]
        
        # Active entries (não expiradas)
        cursor.execute('SELECT COUNT(*) FROM cache WHERE expires_at > ?', (datetime.now(),))
        active = cursor.fetchone()[0]
        
        # Total hits
        cursor.execute('SELECT SUM(hits) FROM cache')
        total_hits = cursor.fetchone()[0] or 0
        
        # Top 5 queries
        cursor.execute('''
            SELECT key, hits, created_at 
            FROM cache 
            WHERE expires_at > ?
            ORDER BY hits DESC 
            LIMIT 5
        ''', (datetime.now(),))
        top_queries = cursor.fetchall()
        
        conn.close()
        
        return {
            'total_entries': total,
            'active_entries': active,
            'expired_entries': total - active,
            'total_hits': total_hits,
            'hit_rate': f"{(total_hits / max(active, 1)):.2f}",
            'top_queries': [
                {'key': key[:8] + '...', 'hits': hits, 'created_at': created_at}
                for key, hits, created_at in top_queries
            ]
        }

# Instância global
cache_service = CacheService()
