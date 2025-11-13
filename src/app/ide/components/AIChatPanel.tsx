"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Code2, FileCode, Bug, Sparkles, Copy, FileDown, Play, Check } from 'lucide-react';
import { aiAssistant, type IDEContext } from '@/ide/aiAssistant';
import { useEditorStore } from '@/ide/editorStore';
import { useFileSystem } from '@/ide/useFileSystem';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your ZacAi coding assistant powered by 23 knowledge domains and 13 AI models. I can help you with:\n\n• Code explanation and documentation\n• Bug fixing and debugging\n• Code generation and refactoring\n• Best practices and optimization\n• Testing and security analysis\n\nSelect code in the editor and use the quick actions, or just ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { tabs, activeTabId, getTab, updateTabContent } = useEditorStore();
  const { fileTree, writeFile } = useFileSystem();

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build IDE context
  const getIDEContext = (): IDEContext => {
    const activeFile = activeTabId ? getTab(activeTabId) : undefined;
    const projectFiles = fileTree.map((node) => node.path);

    return {
      currentFile: activeFile
        ? {
            path: activeFile.path,
            content: activeFile.content,
            language: activeFile.language,
          }
        : undefined,
      openFiles: tabs.map((tab) => ({
        path: tab.path,
        content: tab.content,
        language: tab.language,
      })),
      projectFiles,
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
    const activeFile = activeTabId ? getTab(activeTabId) : undefined;
    
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
    if (filename) {
      // Create new file
      try {
        const path = `/${filename}`;
        await writeFile(path, code);
        // The file system hook will refresh the tree
      } catch (error) {
        console.error('Failed to create file:', error);
      }
    } else if (activeTabId) {
      // Insert into active file
      const activeFile = getTab(activeTabId);
      if (activeFile) {
        updateTabContent(activeTabId, code);
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
      </div>
    </div>
  );
}
