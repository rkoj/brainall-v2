import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Plus, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  currentConversationId?: string;
}

const ConversationHistory = ({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
}: ConversationHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - será substituído por dados reais
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Análise de UX do Brain V1",
      lastMessage: "Vou analisar o Brain V1 e identificar...",
      timestamp: new Date(),
    },
    {
      id: "2",
      title: "Implementação do painel direito",
      lastMessage: "Corrigido! O iframe agora ocupa...",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "3",
      title: "Design do sistema",
      lastMessage: "Configuração inicial do projeto...",
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString("pt-PT");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start"
          variant="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Procurar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                currentConversationId === conv.id && "bg-secondary"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate mb-1">
                    {conv.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(conv.timestamp)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationHistory;
