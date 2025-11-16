import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Terminal, 
  Globe, 
  Box,
  Play,
  Pause,
  X,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  type: "command" | "output" | "success" | "error";
  text: string;
}

interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const RightPanel = ({ isOpen, onToggle }: RightPanelProps) => {
  const [activeTab, setActiveTab] = useState("terminal");
  const [isLive, setIsLive] = useState(true);
  const [webUrl, setWebUrl] = useState("https://manus.im");
  const [currentUrl, setCurrentUrl] = useState("https://manus.im");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    { type: "command", text: "$ npm run dev" },
    { type: "output", text: "" },
    { type: "output", text: "  VITE v5.0.0  ready in 234 ms" },
    { type: "output", text: "" },
    { type: "success", text: "  ➜  Local:   http://localhost:5173/" },
    { type: "success", text: "  ➜  Network: use --host to expose" },
    { type: "output", text: "" },
    { type: "output", text: "✓ Build completed successfully" },
    { type: "output", text: "→ Watching for file changes..." },
  ]);

  useEffect(() => {
    if (scrollRef.current && activeTab === "terminal") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  useEffect(() => {
    if (!isLive || activeTab !== "terminal") return;

    const interval = setInterval(() => {
      const randomLogs = [
        { type: "success" as const, text: "✓ Hot module reload: 45ms" },
        { type: "output" as const, text: "→ Compiling..." },
        { type: "success" as const, text: "✓ Compiled successfully" },
      ];

      if (Math.random() > 0.8) {
        const randomLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
        setLogs((prev) => [...prev.slice(-20), randomLog]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, activeTab]);

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "command":
        return "text-blue-400";
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-300";
    }
  };

  const handleWebNavigate = () => {
    setCurrentUrl(webUrl);
  };

  const handleWebKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleWebNavigate();
    }
  };

  if (!isOpen) {
    return (
      <aside className="w-14 border-l border-border bg-card flex flex-col min-w-0">
        <TooltipProvider>
          <div className="flex flex-col gap-3 py-2 flex-1 overflow-hidden">
            {/* Sandbox Preview */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 cursor-pointer hover:bg-muted/50 py-2 rounded transition-colors",
                    activeTab === "sandbox" && "bg-secondary"
                  )}
                  onClick={() => {
                    setActiveTab("sandbox");
                    onToggle();
                  }}
                >
                  <Box className="w-4 h-4 text-foreground" />
                  <div className="flex flex-col gap-0.5 items-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-underall-green animate-pulse" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Sandbox</p>
              </TooltipContent>
            </Tooltip>

            {/* Terminal Preview */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 cursor-pointer hover:bg-muted/50 py-2 rounded transition-colors",
                    activeTab === "terminal" && "bg-secondary"
                  )}
                  onClick={() => {
                    setActiveTab("terminal");
                    onToggle();
                  }}
                >
                  <Terminal className="w-4 h-4 text-foreground" />
                  <div className="flex flex-col gap-0.5 items-center mt-1 w-full px-1">
                    <div className="w-full h-0.5 bg-green-400/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-gray-400/40 rounded" />
                    <div className="w-full h-0.5 bg-gray-400/40 rounded" />
                    <div className="w-3/4 h-0.5 bg-blue-400/60 rounded" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Terminal</p>
              </TooltipContent>
            </Tooltip>

            {/* Web Preview */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 cursor-pointer hover:bg-muted/50 py-2 rounded transition-colors",
                    activeTab === "web" && "bg-secondary"
                  )}
                  onClick={() => {
                    setActiveTab("web");
                    onToggle();
                  }}
                >
                  <Globe className="w-4 h-4 text-foreground" />
                  <div className="flex flex-col gap-0.5 items-center mt-1 w-full px-1">
                    <div className="w-full h-0.5 bg-primary/60 rounded" />
                    <div className="w-full h-3 bg-muted border border-border/50 rounded-sm mt-0.5" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Web</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-96 lg:w-[28rem] xl:w-[32rem] border-l border-border bg-card flex flex-col min-w-0 transition-all duration-300">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
        <div className="border-b border-border bg-muted/30 flex-shrink-0">
          <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0">
            <TabsTrigger 
              value="sandbox" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary flex-1 sm:flex-initial"
            >
              <Box className="w-4 h-4 mr-2" />
              Sandbox
            </TabsTrigger>
            <TabsTrigger 
              value="terminal"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary flex-1 sm:flex-initial"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Terminal
            </TabsTrigger>
            <TabsTrigger 
              value="web"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary flex-1 sm:flex-initial"
            >
              <Globe className="w-4 h-4 mr-2" />
              Web
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Sandbox Tab */}
        <TabsContent value="sandbox" className="flex-1 m-0 p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Tarefas em Execução</h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">npm run dev</span>
                </div>
                <p className="text-xs text-muted-foreground">Vite dev server rodando em http://localhost:5173</p>
              </div>
              
              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Hot Module Reload</span>
                </div>
                <p className="text-xs text-muted-foreground">Monitorando alterações de ficheiros</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-underall-green animate-pulse" />
                  <span className="text-sm font-medium text-foreground">TypeScript</span>
                </div>
                <p className="text-xs text-muted-foreground">Type checking ativo</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <h3 className="text-sm font-semibold text-foreground mb-2">Ambiente de Desenvolvimento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                <span className="text-muted-foreground">Node.js</span>
                <span className="font-mono text-foreground">v20.10.0</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                <span className="text-muted-foreground">npm</span>
                <span className="font-mono text-foreground">10.2.3</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                <span className="text-muted-foreground">Vite</span>
                <span className="font-mono text-foreground">5.0.0</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <h3 className="text-sm font-semibold text-foreground mb-2">Ações Rápidas</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar servidor
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Terminal className="w-4 h-4 mr-2" />
                Limpar cache
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Terminal Tab */}
        <TabsContent value="terminal" className="flex-1 m-0 flex flex-col bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-[#2d2d30]">
            <div className="flex items-center gap-2">
              {isLive && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400">ao vivo</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? (
                  <Pause className="w-3 h-3 text-gray-400" />
                ) : (
                  <Play className="w-3 h-3 text-gray-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setLogs([])}
              >
                <X className="w-3 h-3 text-gray-400" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 font-mono text-xs" ref={scrollRef}>
            <div className="space-y-0.5">
              {logs.map((log, index) => (
                <div key={index} className={cn("whitespace-pre-wrap", getLogColor(log.type))}>
                  {log.text}
                </div>
              ))}
              <div className="flex items-center gap-1 animate-pulse">
                <span className="text-blue-400">$</span>
                <span className="w-2 h-3 bg-gray-400" />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Web Browser Tab */}
        <TabsContent value="web" className="flex-1 m-0 p-0 flex flex-col h-full">
          <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWebUrl(currentUrl)}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWebUrl("https://manus.im")}>
              <Home className="w-4 h-4" />
            </Button>
            <Input
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              onKeyDown={handleWebKeyDown}
              className="flex-1 h-7 text-xs"
              placeholder="Digite uma URL..."
            />
          </div>

          <iframe
            src={currentUrl}
            className="flex-1 w-full border-0"
            title="Web Browser"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default RightPanel;
