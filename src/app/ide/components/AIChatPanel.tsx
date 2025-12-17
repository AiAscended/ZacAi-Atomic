/**
 * File: src/app/ide/components/AIChatPanel.tsx
 * Purpose: AI chat panel integrated with ZacAi for IDE assistance
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Code2, FileCode, Bug, Sparkles, Copy, FileDown, Play, Check } from 'lucide-react';
import { aiAssistant, type IDEContext } from '@/lib/ide/aiAssistant';
import { useEditorStore } from '@/lib/ide/editorStore';
import { useFileSystem } from '@/lib/ide/useFileSystem';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';

interface Message {
  id: string;
  role: 'user' | 'assistant';
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
  { icon: Code2, label: 'Explain Code', action: 'explain' },
  { icon: FileCode, label: 'Generate Code', action: 'generate' },
  { icon: Bug, label: 'Fix Bug', action: 'fix' },
  { icon: Sparkles, label: 'Optimize', action: 'optimize' },
];

export function AIChatPanel() {
}

interface CodeBlock {
  language: string;
  code: string;
  startIndex: number;
  endIndex: number;
}

interface AIChatPanelProps {
  currentFile?: string;
  currentCode?: string;
  projectContext?: string;
  onInsertCode?: (code: string, language: string) => void;
  onPreviewCode?: (code: string, language: string) => void;
  className?: string;
}

export function AIChatPanel({
  currentFile,
  currentCode,
  projectContext,
  onInsertCode,
  onPreviewCode,
  className,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n- Writing and debugging code\n- Explaining complex concepts\n- Optimizing your functions\n- Generating tests\n- Adding documentation\n\nHow can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openFiles, activeFileId, getFileById, updateFileContent } = useEditorStore();
  const { fs, fileTree } = useFileSystem();

  // Initialize AI assistant
  useEffect(() => {
    const initAI = async () => {
      try {
        await aiAssistant.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
      }
    };
    initAI();
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      openFiles: openFiles.map((file) => ({
        path: file.path,
        content: file.content,
        language: file.language,
      })),
      projectFiles,
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isInitialized) return;
  const extractCodeBlocks = (content: string): CodeBlock[] => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: CodeBlock[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return blocks;
  };

  const renderMessage = (message: Message) => {
    const codeBlocks = extractCodeBlocks(message.content);
    
    if (codeBlocks.length === 0) {
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    codeBlocks.forEach((block, idx) => {
      // Add text before code block
      if (block.startIndex > lastIndex) {
        parts.push(
          <div key={`text-${idx}`} className="whitespace-pre-wrap">
            {message.content.substring(lastIndex, block.startIndex)}
          </div>
        );
      }

      // Add code block with actions
      const highlighted = Prism.highlight(
        block.code,
        Prism.languages[block.language] || Prism.languages.plaintext,
        block.language
      );

      parts.push(
        <div key={`code-${idx}`} className="my-3 rounded-lg overflow-hidden border border-ide-border">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-sidebar-bg border-b border-ide-border">
            <span className="text-xs font-mono text-muted-foreground">
              {block.language}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(block.code)}
                title="Copy code"
              >
                <Copy className="h-3 w-3" />
              </Button>
              {onInsertCode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onInsertCode(block.code, block.language)}
                  title="Insert into editor"
                >
                  <FileCode className="h-3 w-3" />
                </Button>
              )}
              {onPreviewCode && ['html', 'javascript', 'css'].includes(block.language) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onPreviewCode(block.code, block.language)}
                  title="Preview"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <pre className="p-3 overflow-x-auto text-xs">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      );

      lastIndex = block.endIndex;
    });

    // Add remaining text after last code block
    if (lastIndex < message.content.length) {
      parts.push(
        <div key="text-end" className="whitespace-pre-wrap">
          {message.content.substring(lastIndex)}
        </div>
      );
    }

    return <div>{parts}</div>;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Show toast notification
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = getIDEContext();
      const response = await aiAssistant.sendMessage(input, context);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        codeBlocks: response.codeBlocks,
        domains: response.domains,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    const activeFile = getFileById(activeFileId);
    
    if (!activeFile) {
      setInput(`${action} code for: `);
      return;
    }

    setIsLoading(true);

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

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        codeBlocks: response.codeBlocks,
        domains: response.domains,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Quick action error:', error);
      // Build context for AI
      const context = [];
      if (currentFile) {
        context.push(`Current file: ${currentFile}`);
      }
      if (currentCode) {
        context.push(`\nCurrent code:\n\`\`\`\n${currentCode}\n\`\`\``);
      }
      if (projectContext) {
        context.push(`\nProject context: ${projectContext}`);
      }

      const prompt = context.length > 0
        ? `${context.join('\n')}\n\nUser question: ${input}`
        : input;

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          message: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
              onClick={() => handleQuickAction(action.prompt)}
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: Sparkles, label: 'Explain this code', prompt: 'Explain what this code does:' },
    { icon: Sparkles, label: 'Fix errors', prompt: 'Help me fix any errors in this code:' },
    { icon: Sparkles, label: 'Optimize', prompt: 'How can I optimize this code:' },
    { icon: Sparkles, label: 'Add tests', prompt: 'Generate unit tests for this code:' },
  ];

  return (
    <div className={cn('flex flex-col h-full bg-ide-bg', className)}>
      {/* Quick actions */}
      {currentCode && (
        <div className="flex items-center gap-1 p-2 border-b border-ide-border overflow-x-auto">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => setInput(`${action.prompt}\n\n\`\`\`\n${currentCode}\n\`\`\``)}
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
            <div key={message.id}>
              <div
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
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

              {/* Code blocks with actions */}
              {message.codeBlocks && message.codeBlocks.length > 0 && (
                <div className="ml-10 mt-2 space-y-2">
                  {message.codeBlocks.map((block, idx) => {
                    const blockId = `${message.id}-${idx}`;
                    const highlightedCode = Prism.highlight(
                      block.code,
                      Prism.languages[block.language] || Prism.languages.plaintext,
                      block.language
                    );

                    return (
                      <div
                        key={idx}
                        className="rounded-lg overflow-hidden border bg-background"
                      >
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {block.language}
                            </span>
                            {block.filename && (
                              <span className="text-xs text-muted-foreground">
                                {block.filename}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleCopyCode(block.code, blockId)}
                            >
                              {copiedCode === blockId ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleInsertCode(block.code, block.filename)}
                            >
                              <FileDown className="h-3 w-3 mr-1" />
                              {block.filename ? 'Create File' : 'Insert'}
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 overflow-x-auto">
                          <pre className="text-xs">
                            <code
                              dangerouslySetInnerHTML={{ __html: highlightedCode }}
                            />
                          </pre>
                        </div>
                      </div>
                    );
                  })}
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
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-4 py-3',
                  message.role === 'user'
                    ? 'bg-ide-accent text-white'
                    : 'bg-ide-sidebar-bg border border-ide-border'
                )}
              >
                <div className="text-xs opacity-70 mb-2">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="text-sm">
                  {renderMessage(message)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-4 py-3 bg-ide-sidebar-bg border border-ide-border">
                <div className="text-xs opacity-70 mb-2">AI Assistant</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-ide-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-ide-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-ide-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 border-t border-ide-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
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
        <div className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
