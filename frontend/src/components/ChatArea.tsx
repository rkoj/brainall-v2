import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, RefreshCw, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageRenderer from "@/components/MessageRenderer";
import FileUpload from "@/components/FileUpload";
import AgentModeToggle from "@/components/AgentModeToggle";
import AudioRecorder from "@/components/AudioRecorder";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
  }>;
  isAgentMode?: boolean;
}

const ChatArea = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o **Brain V2**. \n\nPosso operar em dois modos:\n- **Chat Normal**: Respostas diretas\n- **Modo Agente**: Executo ações, uso ferramentas e tomo decisões autónomas\n\nPode anexar ficheiros (imagens, áudio, documentos) e alternar entre modos conforme necessário.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAudioRecording = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
      type: "audio/webm",
    });

    const uploadedFile = {
      id: `audio-${Date.now()}`,
      file: audioFile,
      type: "audio" as const,
    };

    setUploadedFiles((prev) => [...prev, uploadedFile]);
    
    toast({
      title: "Áudio adicionado",
      description: "Gravação pronta para enviar",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      files: uploadedFiles.map((f) => ({
        id: f.id,
        name: f.file.name,
        type: f.type,
        size: f.file.size,
      })),
      isAgentMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const hasFiles = uploadedFiles.length > 0;
    setInput("");
    setUploadedFiles([]);
    setIsLoading(true);

    // Simular resposta com base no modo
    setTimeout(() => {
      let responseContent = "";

      if (isAgentMode) {
        responseContent = `🤖 **Modo Agente Ativo**\n\n**Analisando:** "${currentInput}"\n\n### Ações Executadas:\n\n1. ✅ Compreendi a tarefa\n2. ✅ Identifiquei ferramentas necessárias\n3. ✅ Executei operações\n\n\`\`\`javascript\n// Exemplo de código executado pelo agente\nconst result = await executeTask({\n  input: "${currentInput}",\n  mode: "autonomous",\n  tools: ["search", "analyze", "generate"]\n});\n\`\`\`\n\n### Resultado:\n${hasFiles ? `\n📎 Processei ${uploadedFiles.length} ficheiro(s)\n` : ""}\n✨ Tarefa completada com sucesso!`;
      } else {
        responseContent = `💬 **Modo Chat**\n\n**Resposta para:** "${currentInput}"\n\n${hasFiles ? `Recebi ${uploadedFiles.length} ficheiro(s):\n${uploadedFiles.map((f) => `- ${f.file.name} (${f.type})`).join("\n")}\n\n` : ""}Esta é uma resposta direta sem execução de ações.\n\n**Dica:** Ative o Modo Agente para tarefas que requerem uso de ferramentas ou execução autónoma.`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        isAgentMode,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleRegenerate = (messageId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Esta é uma resposta regenerada com conteúdo atualizado.",
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const messageIndex = prev.findIndex((m) => m.id === messageId);
        if (messageIndex === -1) return [...prev, newMessage];
        return [...prev.slice(0, messageIndex + 1), newMessage];
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-subtle min-w-0 flex-1">
      {/* Chat Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-underall-green flex items-center justify-center shadow-glow flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-7 h-7 fill-white">
              <path d="M50 20 L30 40 L50 40 L40 60 L60 40 L50 40 Z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">BrainAll</h1>
            <p className="text-xs text-underall-orange font-medium">Intel | Energy | Technology</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-underall-green flex items-center justify-center flex-shrink-0 shadow-soft">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <Card
                className={cn(
                  "max-w-[80%] shadow-soft relative group",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground p-4"
                    : "bg-card p-4"
                )}
              >
                <MessageRenderer content={message.content} role={message.role} />
                
                {/* Exibir ficheiros anexados */}
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      📎 Ficheiros anexados:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.files.map((file) => (
                        <div
                          key={file.id}
                          className="text-xs bg-secondary px-2 py-1 rounded-md"
                        >
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.isAgentMode && (
                      <span className="text-xs bg-gradient-primary text-white px-2 py-0.5 rounded-full">
                        Agente
                      </span>
                    )}
                  </div>
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRegenerate(message.id)}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </Card>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="p-4 bg-card shadow-soft">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-3 sm:p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-full lg:max-w-5xl xl:max-w-6xl mx-auto space-y-3">
          {/* Agent Mode Toggle */}
          <div className="flex items-center justify-between">
            <AgentModeToggle
              isAgentMode={isAgentMode}
              onToggle={setIsAgentMode}
              isProcessing={isLoading}
            />
            <span className="text-xs text-muted-foreground">
              {isAgentMode
                ? "Modo autónomo com execução de ferramentas"
                : "Chat simples de perguntas e respostas"}
            </span>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-primary rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
            <div className="relative bg-card rounded-xl shadow-medium overflow-hidden">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                className="min-h-[60px] sm:min-h-[80px] border-0 resize-none text-sm px-3 sm:px-4 py-2 sm:py-3 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    maxSizeMB={20}
                  />
                  <AudioRecorder onRecordingComplete={handleAudioRecording} />
                  <span className="text-xs text-muted-foreground">
                    {input.length} caracteres
                    {uploadedFiles.length > 0 && ` • ${uploadedFiles.length} ficheiro(s)`}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
