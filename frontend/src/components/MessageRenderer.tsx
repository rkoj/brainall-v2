import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface MessageRendererProps {
  content: string;
  role: "user" | "assistant";
}

const MessageRenderer = ({ content, role }: MessageRendererProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (role === "user") {
    return <p className="text-foreground whitespace-pre-wrap">{content}</p>;
  }

  const components: Components = {
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");
      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

      if (match) {
        return (
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard(codeString, codeId)}
            >
              {copiedCode === codeId ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <SyntaxHighlighter
              style={oneDark as any}
              language={match[1]}
              PreTag="div"
              className="rounded-md !mt-0"
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <div className="my-4">{children}</div>;
    },
    p({ children }) {
      return <p className="mb-4 last:mb-0">{children}</p>;
    },
    ul({ children }) {
      return <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>;
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>;
    },
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;
