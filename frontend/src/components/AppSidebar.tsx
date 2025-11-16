import { useState } from "react";
import { 
  FileText, 
  Search, 
  BookOpen, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Folder,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  Cpu,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
}

interface ProjectFolder {
  id: string;
  name: string;
  tasks: Task[];
}

const companyProjects: ProjectFolder[] = [
  {
    id: "company-1",
    name: "Projetos Internos",
    tasks: [
      { id: "c1", title: "Sistema de Atendimento", status: "completed" },
      { id: "c2", title: "Portal Colaborador", status: "in-progress" },
    ]
  },
  {
    id: "company-2",
    name: "Clientes",
    tasks: [
      { id: "c3", title: "Dashboard Analytics", status: "pending" },
      { id: "c4", title: "API Integration", status: "in-progress" },
    ]
  }
];

const personalProjects: ProjectFolder[] = [
  {
    id: "personal-1",
    name: "Meus Projetos",
    tasks: [
      { id: "p1", title: "Configuração inicial do LLM", status: "completed" },
      { id: "p2", title: "Interface de teste criada", status: "completed" },
      { id: "p3", title: "Integração com API do modelo", status: "in-progress" },
    ]
  },
  {
    id: "personal-2",
    name: "Experimentação",
    tasks: [
      { id: "p4", title: "Sistema de prompts otimizados", status: "pending" },
      { id: "p5", title: "Histórico de conversas", status: "pending" },
    ]
  }
];

const navItems = [
  { title: "Nova tarefa", icon: FileText },
  { title: "Procurar", icon: Search },
  { title: "Biblioteca", icon: BookOpen },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const [activeTask, setActiveTask] = useState<string | null>("p3");
  const [openFolders, setOpenFolders] = useState<string[]>(["company-1", "personal-1"]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-primary" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const renderFolder = (folder: ProjectFolder) => (
    <Collapsible
      key={folder.id}
      open={openFolders.includes(folder.id)}
      onOpenChange={() => toggleFolder(folder.id)}
      className="mb-2"
    >
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-secondary/50 rounded-md transition-colors">
        {openFolders.includes(folder.id) ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <Folder className="w-4 h-4 text-underall-green" />
        {open && <span className="text-sm font-medium">{folder.name}</span>}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 mt-1">
        <SidebarMenu>
          {folder.tasks.map((task) => (
            <SidebarMenuItem key={task.id}>
              <SidebarMenuButton
                isActive={activeTask === task.id}
                onClick={() => setActiveTask(task.id)}
                tooltip={task.title}
                className={cn(
                  "w-full justify-start",
                  activeTask === task.id && "bg-secondary"
                )}
              >
                {getStatusIcon(task.status)}
                <span className="truncate text-xs">{task.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-full bg-underall-green flex items-center justify-center shadow-glow flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-white">
              <path d="M50 20 L30 40 L50 40 L40 60 L60 40 L50 40 Z" />
            </svg>
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm">BrainAll</span>
              <span className="text-xs text-underall-orange font-medium">Intel | Energy | Technology</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {open && <span>Uso da Empresa</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[200px]">
              {companyProjects.map(renderFolder)}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {open && <span>Meus Projetos</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[200px]">
              {personalProjects.map(renderFolder)}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {open && (
          <div className="mx-2 mb-2 space-y-2">
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Utilizador</span>
              </div>
              <p className="text-xs text-muted-foreground">admin@underall.com</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Estado GPU</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Uso:</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Temp:</span>
                  <span className="font-medium">62°C</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
