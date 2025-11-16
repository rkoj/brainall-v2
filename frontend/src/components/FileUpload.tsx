import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, Image, Music, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "audio" | "document" | "other";
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const FileUpload = ({ onFilesChange, maxFiles = 10, maxSizeMB = 20 }: FileUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileType = (file: File): UploadedFile["type"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text")) {
      return "document";
    }
    return "other";
  };

  const getFileIcon = (type: UploadedFile["type"]) => {
    switch (type) {
      case "image":
        return Image;
      case "audio":
        return Music;
      case "document":
        return FileText;
      default:
        return File;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Máximo de ${maxFiles} ficheiros permitidos`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const invalidFiles = selectedFiles.filter((f) => f.size > maxSizeBytes);
    if (invalidFiles.length > 0) {
      toast({
        title: "Ficheiro muito grande",
        description: `Tamanho máximo: ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = await Promise.all(
      selectedFiles.map(async (file) => {
        const type = getFileType(file);
        let preview: string | undefined;

        // Generate preview for images
        if (type === "image") {
          preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        return {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
          type,
        };
      })
    );

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);

    toast({
      title: "Ficheiros anexados",
      description: `${newFiles.length} ficheiro(s) adicionado(s)`,
    });

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUploadType = (accept: string) => {
    if (inputRef.current) {
      inputRef.current.accept = accept;
      inputRef.current.click();
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.json,.csv"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleUploadType("image/*")}>
            <Image className="mr-2 h-4 w-4" />
            Imagem
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleUploadType("audio/*")}>
            <Music className="mr-2 h-4 w-4" />
            Áudio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleUploadType(".pdf,.doc,.docx")}>
            <FileText className="mr-2 h-4 w-4" />
            Documento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleUploadType("*")}>
            <File className="mr-2 h-4 w-4" />
            Qualquer ficheiro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {files.map((file) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className={cn(
                  "relative group flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/50",
                  file.type === "image" && file.preview && "pr-20"
                )}
              >
                {file.type === "image" && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <Icon className="w-8 h-8 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate max-w-[150px]">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
