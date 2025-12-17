"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Bot,
  User,
  Code2,
  FileCode,
  Bug,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { useAIIDE } from "@/lib/ide/aiIDEIntegration";
import { useEditorStore } from "@/lib/ide/editorStore";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeBlocks?: Array<{
    language: string;
    code: string;
    filename?: string;
  }>;
  domains?: string[];
}

const quickActions = [
  { icon: Code2, label: "Explain Code", prompt: "Explain this code" },
  { icon: FileCode, label: "Generate Code", prompt: "Generate code for" },
  { icon: Bug, label: "Fix Bug", prompt: "Help fix this bug" },
  { icon: Sparkles, label: "Optimize", prompt: "Optimize this code" },
];

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your ZacAi Hybrid LLM coding assistant powered by 23 knowledge domains and 14 AI models. I can help you with:\n\n• Code explanation and documentation\n• Bug fixing and debugging\n• Code generation and refactoring\n• Best practices and optimization\n• Multi-language support\n• Real-time code analysis\n\nWhat would you like help with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use AI IDE integration
  const {
    isInitialized,
    isLoading,
    sendMessage,
    explainCode,
    fixCode,
    optimizeCode,
    generateCode,
  } = useAIIDE();
  const { getActiveTab } = useEditorStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build IDE context
  const getIDEContext = (): IDEContext => {
    const activeFile = getFileById(activeFileId);
    const projectFiles = fileTree.map((node) => node.path);

    return {
      currentFile: activeFile
        ? {
            path: activeFile.path,
            content: activeFile.content,
            language: activeFile.language,
          }
        : undefined,
      openFiles: openFiles.map((file: EditorTab) => ({
        path: file.path,
        content: file.content,
        language: file.language,
      })),
      projectFiles,
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    try {
      // Get current editor context
      const activeTab = getActiveTab();
      const context = activeTab
        ? {
            currentFile: {
              path: activeTab.path,
              content: activeTab.content,
              language: activeTab.language,
              cursorPosition: activeTab.cursorPosition,
            },
            openFiles: useEditorStore.getState().tabs.map((t) => t.path),
          }
        : undefined;

      // Send to AI with full context
      const response = await sendMessage(userInput, context);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        codeBlocks: response.codeBlocks,
        domains: response.domains,
      };

      // Handle code blocks and actions
      if (response.code && response.code.length > 0) {
        toast({
          title: "Code Generated",
          description: `${response.code.length} code snippet(s) available`,
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt + ": ");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

    try {
      let response;
      const code = activeFile.content;
      const language = activeFile.language;

      switch (action) {
        case 'explain':
          response = await aiAssistant.explainCode(code, language);
          break;
        case 'fix':
          response = await aiAssistant.fixCode(code, language);
          break;
        case 'optimize':
          response = await aiAssistant.optimizeCode(code, language);
          break;
        case 'generate':
          setInput('Generate code for: ');
          setIsLoading(false);
          return;
        default:
          setIsLoading(false);
          return;
      }

      const language = match[1] || "plaintext";
      const code = match[2].trim();

      // Add code block with copy button
      parts.push(
        <div
          key={match.index}
          className="my-2 rounded-md overflow-hidden border"
        >
          <div className="flex items-center justify-between bg-muted/50 px-3 py-1 border-b">
            <span className="text-xs text-muted-foreground">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => handleCopyCode(code)}
            >
              {copiedCode === code ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <pre className="p-3 overflow-x-auto bg-muted/30">
            <code className="text-xs">{code}</code>
          </pre>
        </div>,
      );

      lastIndex = match.index + match[0].length;
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInsertCode = async (code: string, filename?: string) => {
    if (!fs) return;

    if (filename) {
      // Create new file
      try {
        const path = `/${filename}`;
        await fs.write(path, code);
        // The file system hook will refresh the tree
      } catch (error) {
        console.error('Failed to create file:', error);
      }
    } else if (activeFileId) {
      // Insert into active file
      const activeFile = getFileById(activeFileId);
      if (activeFile) {
        updateFileContent(activeFileId, code);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b">
        <div className="grid grid-cols-2 gap-1">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() => handleQuickAction(action.action)}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.domains && message.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.domains.slice(0, 3).map((domain) => (
                        <span
                          key={domain}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary"
                        >
                          {domain.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about your code..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading || !isInitialized}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !isInitialized}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isInitialized ? (
            <>
              ✅ Phase 5 Complete: AI-powered coding assistant active
            </>
          ) : (
            <>
              Initializing AI assistant...
            </>
          )}
        </p>
      </div>
    </div>
  );
}
