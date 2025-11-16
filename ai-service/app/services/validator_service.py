"""Serviço de Validação, Business Rules e Security Policies"""
import re
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

class ValidatorService:
    """
    Valida outputs do LLM e aplica business rules e security policies
    """
    
    def __init__(self):
        # Patterns de segurança - não revelar
        self.security_patterns = [
            (r'password[:\s=]+[^\s]+', 'PASSWORD_REDACTED'),
            (r'api[_-]?key[:\s=]+[^\s]+', 'API_KEY_REDACTED'),
            (r'token[:\s=]+[^\s]+', 'TOKEN_REDACTED'),
            (r'secret[:\s=]+[^\s]+', 'SECRET_REDACTED'),
            (r'ssh[_-]?key[:\s]+[^\s]+', 'SSH_KEY_REDACTED'),
        ]
        
        # Comandos perigosos - avisar
        self.dangerous_commands = [
            'rm -rf /',
            'dd if=/dev/zero',
            'dd if=/dev/',
            'mkfs.',
            'wipefs',
            'format c:',
            ':(){ :|:& };:',  # fork bomb
            'chmod 777 /',
            # Ceph specific
            'ceph osd purge',
            'ceph osd destroy',
            'ceph osd rm',
            'ceph mon remove',
            'ceph pg force',
            # Proxmox specific
            'pvecm delnode',
            'qm destroy',
            'pct destroy',
            'lvremove -f',
            'vgremove -f',
            # User management
            'userdel -r',
            'userdel -f',
        ]
        
        # Keywords de hallucination - verificar se tem fonte
        self.hallucination_keywords = [
            'de acordo com',
            'segundo',
            'conforme',
            'baseado em',
            'citando',
        ]
        
        logger.info("ValidatorService initialized")
    
    def validate_response(
        self, 
        response: str, 
        sources: List[str] = None,
        query: str = ""
    ) -> Tuple[str, Dict]:
        """
        Valida resposta do LLM
        
        Args:
            response: Resposta do LLM
            sources: Fontes usadas (RAG)
            query: Query original do usuário
            
        Returns:
            Tupla (resposta_validada, metadata)
        """
        metadata = {
            'security_issues': [],
            'hallucination_risk': 'low',
            'dangerous_commands': [],
            'validation_passed': True,
            'modifications': []
        }
        
        validated_response = response
        
        # 1. Security Check - Redact sensitive data
        validated_response, security_issues = self._apply_security_policies(validated_response)
        if security_issues:
            metadata['security_issues'] = security_issues
            metadata['modifications'].append('security_redaction')
            logger.warning(f"Security issues found and redacted: {security_issues}")
        
        # 2. Dangerous Commands Check
        dangerous = self._check_dangerous_commands(validated_response)
        if dangerous:
            metadata['dangerous_commands'] = dangerous
            metadata['modifications'].append('dangerous_command_warning')
            logger.warning(f"Dangerous commands detected: {dangerous}")
            # Adicionar warning na resposta
            warning = "\n\n⚠️ **AVISO DE SEGURANÇA**: Esta resposta contém comandos potencialmente perigosos. Revise cuidadosamente antes de executar."
            validated_response += warning
        
        # 3. Hallucination Check
        hallucination_risk = self._check_hallucination_risk(validated_response, sources)
        metadata['hallucination_risk'] = hallucination_risk
        if hallucination_risk == 'high':
            logger.warning(f"High hallucination risk detected")
            # Adicionar disclaimer
            disclaimer = "\n\n💡 **Nota**: Esta resposta foi gerada sem fontes específicas da base de conhecimento. Verifique a informação antes de usar."
            validated_response += disclaimer
            metadata['modifications'].append('hallucination_disclaimer')
        
        # 4. Length Check
        if len(validated_response) < 20:
            metadata['validation_passed'] = False
            metadata['modifications'].append('response_too_short')
            logger.warning(f"Response too short: {len(validated_response)} chars")
        
        # 5. Empty Response Check
        if not validated_response.strip():
            metadata['validation_passed'] = False
            metadata['modifications'].append('empty_response')
            logger.error("Empty response detected")
        
        logger.info(f"Validation complete: {metadata}")
        return validated_response, metadata
    
    def _apply_security_policies(self, text: str) -> Tuple[str, List[str]]:
        """Aplica políticas de segurança - redact sensitive data"""
        issues = []
        modified_text = text
        
        for pattern, replacement in self.security_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                issues.append(f"Found {len(matches)} {replacement}")
                modified_text = re.sub(pattern, replacement, modified_text, flags=re.IGNORECASE)
        
        return modified_text, issues
    
    def _check_dangerous_commands(self, text: str) -> List[str]:
        """Verifica comandos perigosos"""
        found = []
        for cmd in self.dangerous_commands:
            if cmd.lower() in text.lower():
                found.append(cmd)
        return found
    
    def _check_hallucination_risk(self, response: str, sources: List[str] = None) -> str:
        """
        Verifica risco de hallucination
        
        Returns:
            'low', 'medium', 'high'
        """
        # Se não tem fontes, risco é alto
        if not sources or len(sources) == 0:
            return 'high'
        
        # Se tem keywords de citação mas não tem fontes, risco médio
        has_citation_keywords = any(kw in response.lower() for kw in self.hallucination_keywords)
        if has_citation_keywords and len(sources) < 2:
            return 'medium'
        
        # Se tem fontes e não tem keywords suspeitas, risco baixo
        return 'low'
    
    def validate_query(self, query: str) -> Tuple[bool, str]:
        """
        Valida query do usuário
        
        Returns:
            Tupla (is_valid, error_message)
        """
        if not query or not query.strip():
            return False, "Query vazia"
        
        if len(query) > 5000:
            return False, "Query muito longa (máx 5000 caracteres)"
        
        # Check for injection attempts
        injection_patterns = [
            r'<script',
            r'javascript:',
            r'onerror=',
            r'onclick=',
        ]
        
        for pattern in injection_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                logger.warning(f"Potential injection attempt detected: {pattern}")
                return False, "Query contém padrões suspeitos"
        
        return True, ""

# Instância global
validator_service = ValidatorService()
