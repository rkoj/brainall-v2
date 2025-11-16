import { useState } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ChatArea from "@/components/ChatArea";
import RightPanel from "@/components/RightPanel";
import ResizablePanel from "@/components/ResizablePanel";
import ConversationHistory from "@/components/ConversationHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelRightClose, PanelRightOpen, History, Search } from "lucide-react";
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const { toast } = useToast();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR,
      callback: () => {
        document.querySelector<HTMLButtonElement>('[data-sidebar-trigger]')?.click();
      },
    },
    {
      ...KEYBOARD_SHORTCUTS.SEARCH,
      callback: () => {
        toast({
          title: "Pesquisa",
          description: "Funcionalidade de pesquisa em desenvolvimento",
        });
      },
    },
    {
      ...KEYBOARD_SHORTCUTS.NEW_CHAT,
      callback: () => {
        handleNewConversation();
      },
    },
  ]);

  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
    toast({
      title: "Nova Conversa",
      description: "Iniciada uma nova conversa",
    });
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setIsHistoryOpen(false);
    toast({
      title: "Conversa carregada",
      description: `Conversa ${id} selecionada`,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden min-h-0">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header com trigger do sidebar */}
          <header className="h-12 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4 flex-shrink-0">
            <SidebarTrigger data-sidebar-trigger />
            <div className="flex items-center gap-2">
              <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <History className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <ConversationHistory
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    currentConversationId={currentConversationId}
                  />
                </SheetContent>
              </Sheet>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="h-8 w-8"
              >
                {isRightPanelOpen ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </Button>
              <ThemeToggle />
            </div>
          </header>
          
          {/* Área principal */}
          <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
            <ChatArea />
            <ResizablePanel
              defaultWidth={512}
              minWidth={320}
              maxWidth={800}
              side="right"
            >
              <RightPanel isOpen={isRightPanelOpen} onToggle={() => setIsRightPanelOpen(!isRightPanelOpen)} />
            </ResizablePanel>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
