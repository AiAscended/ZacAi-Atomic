'use client';

/**
 * Enhanced Homepage with ChatGPT-Style Interface
 * - Initial landing with prompt suggestions
 * - Clean, modern chat UI
 * - Proper response formatting
 * - Code highlighting and copy functionality
 */

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Send, Sparkles } from 'lucide-react';
import { ResponseRenderer } from '@/components/ResponseRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  contentBlocks?: {
    textBlocks: Array<{ id: string; content: string }>;
    codeBlocks: Array<{ id: string; language: string; code: string; filename?: string }>;
  };
  thinkingSteps?: Array<{
    step: string;
    description: string;
    timestamp: number;
    data?: Record<string, unknown>;
  }>;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: '💡',
    title: 'Explain a concept',
    prompt: 'Explain the difference between React Server Components and Client Components',
  },
  {
    icon: '🛠️',
    title: 'Build something',
    prompt: 'Create a responsive navigation component with TypeScript and Tailwind CSS',
  },
  {
    icon: '🐛',
    title: 'Debug code',
    prompt: 'Help me fix this TypeScript error in my Next.js app',
  },
  {
    icon: '📚',
    title: 'Learn best practices',
    prompt: 'What are the best practices for state management in React 2025?',
  },
  {
    icon: '⚡',
    title: 'Optimize performance',
    prompt: 'How can I improve the performance of my Next.js application?',
  },
];

export default function EnhancedHomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [systemStatus, setSystemStatus] = useState('Initializing AI system...');
  const [sessionId, setSessionId] = useState('');
  const [expandedThinking, setExpandedThinking] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resizeInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    resizeInput();
  }, [input, resizeInput]);

  useEffect(() => {
    async function initializeSession() {
  setSystemStatus('Connecting to AI system...');
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'initialize' }),
        });
        if (!res.ok) throw new Error(`Failed to initialize AI system (${res.status})`);
        const data = await res.json();
        setSessionId(data.sessionId);
        setAiReady(true);
        setSystemStatus('AI system ready');
      } catch {
        setSystemStatus('Failed to initialize AI system');
      }
    }
    initializeSession();
  }, []);

  const handleSubmit = async (promptText?: string) => {
    const finalPrompt = promptText || input.trim();
    if (!finalPrompt || !aiReady || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: finalPrompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          prompt: finalPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.text || 'No response',
        contentBlocks: data.contentBlocks,
        thinkingSteps: data.thinkingSteps,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleThinking = (idx: number) => {
    setExpandedThinking((current) => (current === idx ? null : idx));
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.role === 'assistant' && msg.contentBlocks) {
      const hasTextBlocks = msg.contentBlocks.textBlocks && msg.contentBlocks.textBlocks.length > 0;
      const hasCodeBlocks = msg.contentBlocks.codeBlocks && msg.contentBlocks.codeBlocks.length > 0;

      if (hasTextBlocks || hasCodeBlocks) {
        const textBlocks = msg.contentBlocks.textBlocks.map((block) => ({
          ...block,
          type: 'paragraph' as const,
        }));
        return <ResponseRenderer textBlocks={textBlocks} codeBlocks={msg.contentBlocks.codeBlocks} />;
      }

      if (msg.content && msg.content.trim().length > 0) {
        return <div className="whitespace-pre-wrap text-sm">{msg.content}</div>;
      }

      return <div className="text-sm text-muted-foreground">No response content available</div>;
    }
    return <div className="whitespace-pre-wrap text-sm">{msg.content}</div>;
  };

  // Show initial landing page with suggestions
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="max-w-4xl w-full space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                ZacAi Atomic
              </h1>
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Hybrid Multi-Domain AI Assistant
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${aiReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-slate-500 dark:text-slate-400">{systemStatus}</span>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
              <Card
                key={idx}
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-indigo-500 dark:hover:border-indigo-400"
                onClick={() => !isLoading && aiReady && handleSubmit(suggestion.prompt)}
              >
                <div className="space-y-2">
                  <div className="text-3xl">{suggestion.icon}</div>
                  <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {suggestion.prompt}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Input Area */}
          <Card className="p-6 shadow-xl">
            <form
              className="flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about React, Next.js, TypeScript, programming..."
                disabled={!aiReady || isLoading}
                className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                rows={3}
                onInput={resizeInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!aiReady || isLoading || !input.trim()}
                size="lg"
                className="self-end"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Show chat interface once conversation starts
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">ZacAi Atomic</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${aiReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-xs text-slate-500">{systemStatus}</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <article
                className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.role === 'assistant'
                      ? 'bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700'
                      : 'bg-red-500 text-white'
                }`}
              >
                <div className="text-xs font-semibold opacity-70 mb-3">
                  {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI Assistant' : 'Error'}
                </div>
                {renderMessageContent(msg)}

                {msg.role === 'assistant' && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleThinking(idx)}
                      className="mt-4 w-full flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="font-medium">AI Thinking Process ({msg.thinkingSteps.length} steps)</span>
                      {expandedThinking === idx ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedThinking === idx && (
                      <div className="mt-3 space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        {msg.thinkingSteps.map((step, stepIdx) => (
                          <div key={stepIdx} className="border-l-2 border-indigo-600 pl-3 py-1">
                            <div className="font-medium text-indigo-700 dark:text-indigo-400 text-xs">
                              {step.description}
                            </div>
                            <div className="opacity-60 text-xs mt-1">{step.timestamp}ms</div>
                            {step.data && (
                              <pre className="text-xs mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto">
                                {JSON.stringify(step.data, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </article>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky bottom-0 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <form
            className="flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={!aiReady || isLoading}
              className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              rows={1}
              onInput={resizeInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button type="submit" disabled={!aiReady || isLoading || !input.trim()} size="lg">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
