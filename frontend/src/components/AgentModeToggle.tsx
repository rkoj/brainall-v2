import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap, ZapOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentModeToggleProps {
  isAgentMode: boolean;
  onToggle: (enabled: boolean) => void;
  isProcessing?: boolean;
}

const AgentModeToggle = ({
  isAgentMode,
  onToggle,
  isProcessing = false,
}: AgentModeToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Button
              variant={isAgentMode ? "default" : "outline"}
              size="sm"
              onClick={() => onToggle(!isAgentMode)}
              disabled={isProcessing}
              className={cn(
                "relative transition-all",
                isAgentMode && "bg-gradient-primary shadow-glow"
              )}
            >
              {isAgentMode ? (
                <Zap className="h-4 w-4 mr-2" />
              ) : (
                <ZapOff className="h-4 w-4 mr-2" />
              )}
              Modo Agente
              {isProcessing && isAgentMode && (
                <Sparkles className="h-3 w-3 ml-2 animate-pulse" />
              )}
            </Button>

            {isAgentMode && (
              <Badge variant="secondary" className="animate-pulse">
                Ativo
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="max-w-xs space-y-2">
            <p className="font-semibold">
              {isAgentMode ? "Modo Agente Ativo" : "Modo Chat Normal"}
            </p>
            <p className="text-xs">
              {isAgentMode
                ? "O agente pode executar ações, usar ferramentas e tomar decisões autónomas para completar tarefas complexas."
                : "Chat simples de perguntas e respostas sem execução de ações."}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AgentModeToggle;
