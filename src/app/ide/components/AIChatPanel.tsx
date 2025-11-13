/**
 * File: src/app/ide/components/AIChatPanel.tsx
 * Purpose: AI chat panel integrated with ZacAi for IDE assistance
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Copy, FileCode, Eye, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
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
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your code..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
