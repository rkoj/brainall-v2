# Storage Box Hetzner - Análise Completa

**Data:** 15 Novembro 2025  
**Nome:** brainextbox01  
**ID:** #486322  
**Autor:** Manus AI

---

## 📊 RESUMO EXECUTIVO

O **brainextbox01** é um Storage Box BX21 de **5TB** em Helsinki, criado há 18 dias e ainda **completamente vazio** (0 bytes usados). Está na mesma região que o GPU server e 2 AX102, ideal para armazenamento centralizado do projeto BrainAll V2.

**Custo:** €10.90/mês  
**Capacidade:** 5 TB  
**Uso atual:** 0 B (0%)  
**Localização:** 🇫🇮 Helsinki (HEL1-BX46)

---

## 🔧 ESPECIFICAÇÕES

### Hardware
```yaml
Modelo: BX21
Capacidade: 5 TB (5000 GB)
Uso atual: 0 B (0%)
Disponível: 5 TB (100%)
```

### Localização
```yaml
Datacenter: HEL1-BX46
Cidade: Helsinki
País: Finland
Network Zone: eu-central
```

### Quotas
```yaml
Disk usage: 0 B / 5 TB
Snapshots: 0 / 20 (máximo 20 snapshots)
Auto snapshots: 0 / 20 (máximo 20 automáticos)
Subaccounts: 0 / 100 (máximo 100 subcontas)
```

---

## 🌐 CREDENCIAIS DE ACESSO

### Servidor e Autenticação
```yaml
Server: u503462.your-storagebox.de
Username: u503462
Password: (precisa ser obtida via "Reset password")
```

### Protocolos Suportados
```yaml
✅ SMB/CIFS Support (Samba)
✅ WebDAV Support
✅ SSH/SFTP Support
✅ External Reachability
```

---

## 📁 MÉTODOS DE ACESSO

### 1. SSH/SFTP (Recomendado para Linux)
```bash
# Acesso via SFTP
sftp -P 23 u503462@u503462.your-storagebox.de

# Acesso via SSH (apenas comandos limitados)
ssh -p 23 u503462@u503462.your-storagebox.de

# Mount via SSHFS
sshfs -p 23 u503462@u503462.your-storagebox.de:/ /mnt/storagebox
```

**Porta SSH:** 23 (não é a porta padrão 22!)

### 2. SMB/CIFS (Samba)
```bash
# Mount via CIFS (Linux)
mount -t cifs //u503462.your-storagebox.de/backup /mnt/storagebox \
  -o username=u503462,password=YOUR_PASSWORD,iocharset=utf8,file_mode=0777,dir_mode=0777

# Adicionar ao /etc/fstab para mount automático
//u503462.your-storagebox.de/backup /mnt/storagebox cifs \
  username=u503462,password=YOUR_PASSWORD,iocharset=utf8,file_mode=0777,dir_mode=0777 0 0
```

**Share:** `//u503462.your-storagebox.de/backup`

### 3. WebDAV (HTTP)
```bash
# Mount via davfs2 (Linux)
mount -t davfs https://u503462.your-storagebox.de /mnt/storagebox

# URL WebDAV
https://u503462.your-storagebox.de
```

### 4. rsync (via SSH)
```bash
# Sync de ficheiros via rsync
rsync -avz -e "ssh -p 23" /local/path/ u503462@u503462.your-storagebox.de:/remote/path/

# Backup incremental
rsync -avz --delete -e "ssh -p 23" /data/ u503462@u503462.your-storagebox.de:/backup/
```

---

## 🔐 SEGURANÇA

### Reset Password
Para obter/resetar a password:
1. Ir ao Hetzner Console
2. Storage Boxes → brainextbox01
3. Actions → Reset password
4. Nova password será gerada

### SSH Keys (Recomendado)
```bash
# Adicionar SSH key para acesso sem password
# 1. Gerar key (se não tiver)
ssh-keygen -t ed25519 -C "brainall-storagebox"

# 2. Copiar public key
cat ~/.ssh/id_ed25519.pub

# 3. Adicionar no Hetzner Console:
# Storage Boxes → brainextbox01 → Change settings → SSH Keys
```

### Subaccounts
- Criar subcontas com permissões limitadas
- Máximo: 100 subcontas
- Útil para separar acessos por serviço

---

## 📸 SNAPSHOTS

### Características
```yaml
Manual Snapshots: 0 / 20
Auto Snapshots: 0 / 20
Total disponível: 40 snapshots
```

### Como Usar
```bash
# Criar snapshot manual (via SSH)
ssh -p 23 u503462@u503462.your-storagebox.de "snapshot create"

# Listar snapshots
ssh -p 23 u503462@u503462.your-storagebox.de "snapshot list"

# Restaurar snapshot
ssh -p 23 u503462@u503462.your-storagebox.de "snapshot restore SNAPSHOT_ID"

# Apagar snapshot
ssh -p 23 u503462@u503462.your-storagebox.de "snapshot delete SNAPSHOT_ID"
```

### Auto Snapshots
- Configurar no Hetzner Console
- Frequência: Diária, Semanal, Mensal
- Retenção automática

---

## 🚀 INTEGRAÇÃO COM BRAINALL V2

### Estratégia de Storage

#### 1. Modelos LLM (GPU Server)
```bash
# Mount no GPU server
mkdir -p /mnt/models
sshfs -p 23 u503462@u503462.your-storagebox.de:/models /mnt/models \
  -o allow_other,default_permissions,reconnect

# Mover modelos Ollama para Storage Box
rsync -avz --progress /usr/share/ollama/.ollama/models/ \
  u503462@u503462.your-storagebox.de:/models/ollama/
```

**Vantagem:** Libertar 60GB no GPU server

#### 2. Uploads de Utilizadores (Bastion/Backend)
```bash
# Mount no bastion
mkdir -p /mnt/uploads
mount -t cifs //u503462.your-storagebox.de/backup/uploads /mnt/uploads \
  -o username=u503462,password=PASSWORD,iocharset=utf8

# Configurar backend para guardar em /mnt/uploads
```

**Vantagem:** Armazenamento centralizado, não ocupa disco das VMs

#### 3. Backups Automáticos
```bash
# Cron job para backup diário (no prox-101)
0 2 * * * rsync -avz --delete -e "ssh -p 23" \
  /var/lib/vz/dump/ \
  u503462@u503462.your-storagebox.de:/backups/proxmox/
```

**Vantagem:** Backups off-site automáticos

#### 4. Logs Centralizados
```bash
# Mount para logs
mkdir -p /mnt/logs
sshfs -p 23 u503462@u503462.your-storagebox.de:/logs /mnt/logs

# Configurar rsyslog ou syslog-ng para enviar logs
```

**Vantagem:** Logs persistentes e centralizados

#### 5. Datasets e Training Data
```bash
# Armazenar datasets grandes
mkdir -p /mnt/datasets
sshfs -p 23 u503462@u503462.your-storagebox.de:/datasets /mnt/datasets
```

**Vantagem:** 5TB para datasets de treino

---

## 📊 DISTRIBUIÇÃO PROPOSTA

### Estrutura de Diretórios
```
/
├── models/              # Modelos LLM (60GB+)
│   ├── ollama/
│   ├── vllm/
│   └── whisper/
├── uploads/             # Ficheiros de utilizadores (variável)
│   ├── images/
│   ├── audio/
│   ├── documents/
│   └── videos/
├── backups/             # Backups automáticos (500GB+)
│   ├── proxmox/
│   ├── databases/
│   └── configs/
├── logs/                # Logs centralizados (10GB+)
│   ├── gpu/
│   ├── bastion/
│   └── proxmox/
├── datasets/            # Datasets de treino (1TB+)
│   ├── text/
│   ├── images/
│   └── audio/
└── brain_memory/        # Memória do agente (variável)
    ├── embeddings/
    ├── vector_db/
    └── cache/
```

### Estimativa de Uso
```yaml
Modelos LLM: 60 GB
Uploads (1 ano): 100 GB
Backups: 500 GB
Logs (1 ano): 10 GB
Datasets: 1 TB
Brain Memory: 500 GB
---
Total estimado: ~2.2 TB / 5 TB (44%)
Margem: 2.8 TB (56%)
```

---

## ⚡ PERFORMANCE

### Latência (de Helsinki)
```yaml
GPU Server (HEL1-DC3): ~1-2ms (mesma região)
prox-101 (HEL1-DC7): ~1-2ms (mesma região)
prox-106 (HEL1-DC7): ~1-2ms (mesma região)
prox-102 (FSN1-DC7): ~5-10ms (Frankfurt → Helsinki)
```

### Bandwidth
```yaml
Upload: 1 Gbit/s (limitado pelo servidor)
Download: 1 Gbit/s (limitado pelo servidor)
Concurrent connections: Ilimitadas
```

### Casos de Uso
```yaml
✅ Excelente para:
- Backup automático
- Armazenamento de modelos
- Logs centralizados
- Uploads de utilizadores
- Datasets grandes

⚠️ Não ideal para:
- Database principal (latência)
- Cache de alta frequência
- Workloads I/O intensivos
```

---

## 🔧 COMANDOS ÚTEIS

### Testar Conectividade
```bash
# Ping (ICMP pode estar bloqueado)
ping u503462.your-storagebox.de

# Testar SSH
ssh -p 23 u503462@u503462.your-storagebox.de "echo Connection OK"

# Testar SFTP
echo "ls" | sftp -P 23 u503462@u503462.your-storagebox.de

# Testar SMB
smbclient //u503462.your-storagebox.de/backup -U u503462
```

### Verificar Espaço
```bash
# Via SSH
ssh -p 23 u503462@u503462.your-storagebox.de "df -h"

# Via SFTP
echo "df" | sftp -P 23 u503462@u503462.your-storagebox.de
```

### Sincronizar Dados
```bash
# Upload de ficheiros
rsync -avz --progress -e "ssh -p 23" \
  /local/data/ \
  u503462@u503462.your-storagebox.de:/remote/data/

# Download de ficheiros
rsync -avz --progress -e "ssh -p 23" \
  u503462@u503462.your-storagebox.de:/remote/data/ \
  /local/data/

# Sync bidirecional (cuidado!)
rsync -avzu --progress -e "ssh -p 23" \
  /local/data/ \
  u503462@u503462.your-storagebox.de:/remote/data/
```

---

## 💰 CUSTO E ESCALABILIDADE

### Custo Atual
```yaml
Plano: BX21
Capacidade: 5 TB
Preço: €10.90/mês (€130.80/ano)
Custo por TB: €2.18/mês
```

### Rescale (Upgrade)
```yaml
BX31: 10 TB - €20.90/mês
BX41: 20 TB - €40.90/mês
BX51: 40 TB - €80.90/mês
```

**Nota:** Upgrade pode ser feito a qualquer momento via Console.

---

## ⚠️ LIMITAÇÕES E AVISOS

### Limitações Técnicas
```yaml
❌ Não é um filesystem POSIX completo
❌ Sem suporte a hard links
❌ Sem suporte a file locking (alguns casos)
❌ Latência maior que storage local
❌ Dependente de conectividade de rede
```

### Boas Práticas
```yaml
✅ Usar para armazenamento de longo prazo
✅ Ideal para backups e arquivos
✅ Bom para ficheiros grandes (>1MB)
✅ Usar snapshots para proteção
✅ Monitorizar uso de espaço
✅ Testar restore de backups regularmente
```

### Casos a Evitar
```yaml
❌ Database principal (usar Ceph ou local)
❌ Cache de alta frequência (usar Redis local)
❌ Logs em tempo real (buffer localmente)
❌ Compilação de código (usar disco local)
❌ Workloads I/O random intensivos
```

---

## 🎯 PRÓXIMOS PASSOS

### 1. Obter Password
```bash
# Via Hetzner Console
Actions → Reset password
```

### 2. Configurar SSH Keys
```bash
# Gerar key
ssh-keygen -t ed25519 -f ~/.ssh/storagebox_ed25519

# Adicionar no Console
# Storage Boxes → brainextbox01 → Change settings → SSH Keys
```

### 3. Testar Conectividade
```bash
# Do GPU server
ssh -p 23 -i ~/.ssh/storagebox_ed25519 u503462@u503462.your-storagebox.de

# Do prox-101
ssh -p 23 u503462@u503462.your-storagebox.de
```

### 4. Mount Inicial
```bash
# GPU server - Mount para modelos
mkdir -p /mnt/storagebox
sshfs -p 23 u503462@u503462.your-storagebox.de:/ /mnt/storagebox

# Criar estrutura de diretórios
mkdir -p /mnt/storagebox/{models,uploads,backups,logs,datasets,brain_memory}
```

### 5. Migrar Modelos Ollama
```bash
# Backup atual
tar -czf /tmp/ollama_models_backup.tar.gz /usr/share/ollama/.ollama/models/

# Sync para Storage Box
rsync -avz --progress -e "ssh -p 23" \
  /usr/share/ollama/.ollama/models/ \
  u503462@u503462.your-storagebox.de:/models/ollama/

# Verificar
ssh -p 23 u503462@u503462.your-storagebox.de "du -sh /models/ollama"
```

---

## 📝 CONCLUSÃO

O **brainextbox01** é um Storage Box de **5TB** em Helsinki, ideal para o projeto BrainAll V2. Está **vazio e pronto para uso**, na mesma região que a maioria da infraestrutura (latência <2ms).

**Recomendações:**
1. ✅ Usar para modelos LLM (libertar 60GB no GPU)
2. ✅ Usar para uploads de utilizadores
3. ✅ Configurar backups automáticos
4. ✅ Centralizar logs
5. ⚠️ NÃO usar para database principal

**Próxima Ação:**
- Obter password via Console
- Configurar SSH keys
- Testar conectividade
- Migrar modelos Ollama

---

**Relatório gerado por:** Manus AI  
**Data:** 15 Novembro 2025  
**Versão:** 1.0
