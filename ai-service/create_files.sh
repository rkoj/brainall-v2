#!/bin/bash

# config.py
cat > app/config.py << 'EOF'
"""Configurações do BrainAll AI Service"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_TITLE: str = "BrainAll AI Service"
    API_VERSION: str = "1.0.0"
    VLLM_BASE_URL: str = "http://65.21.33.83:8001/v1"
    VLLM_API_KEY: str = "brainall-v2-secret-key"
    VLLM_MODEL: str = "qwen-14b"
    CHROMA_PERSIST_DIR: str = "./data/vectordb"
    BASTION_HOST: str = "192.168.100.102"
    BASTION_USER: str = "root"
    BASTION_PASSWORD: str = "Cl@$$UNDER2025"
    
    class Config:
        env_file = ".env"

settings = Settings()
EOF

echo "✅ Arquivos criados!"
