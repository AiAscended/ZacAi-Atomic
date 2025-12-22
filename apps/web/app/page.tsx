"use client";

/**
 * Enhanced Homepage with ChatGPT-Style Interface
 * - Initial landing with prompt suggestions
 * - Clean, modern chat UI
 * - Proper response formatting
 * - Code highlighting and copy functionality
 */


import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useIsClient } from "@/lib/useIsClient";
// Utility hook to check if running on client
// File: apps/web/src/lib/useIsClient.ts
// export function useIsClient() { const [isClient, setIsClient] = useState(false); useEffect(() => { setIsClient(true); }, []); return isClient; }
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Send, Sparkles } from "lucide-react";
import { ResponseRenderer } from "@/components/ResponseRenderer";
import { useChatSettings } from "@/context/ChatSettingsContext";
import { ChatInput } from "@/components/chat/ChatInput";
import { Volume2 } from "lucide-react";

const PROMPT_SUGGESTIONS = [
  {
    icon: "💡",
    title: "Explain a concept",
    prompt:
      "Explain the difference between React Server Components and Client Components",
  },
  {
    icon: "🛠️",
    title: "Build something",
    prompt:
      "Create a responsive navigation component with TypeScript and Tailwind CSS",
  },
  {
    icon: "🐛",
    title: "Debug code",
    prompt: "Help me fix this TypeScript error in my Next.js app",
  },
  {
    icon: "📚",
    title: "Learn best practices",
    prompt: "What are the best practices for state management in React 2025?",
  },
  {
    icon: "⚡",
    title: "Optimize performance",
    prompt: "How can I improve the performance of my Next.js application?",
  },
];

function speakText(text: string, voice: SpeechSynthesisVoice | null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new window.SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  contentBlocks?: {
    textBlocks: Array<{ id: string; content: string }>;
    codeBlocks: Array<{
      id: string;
      language: string;
      code: string;
      filename?: string;
    }>;
  };
  thinkingSteps?: Array<{
    step: string;
    description: string;
    timestamp: number;
    data?: Record<string, unknown>;
  }>;
}




export default function ChatPage() {
  // Remove isClient from render logic to avoid hydration mismatch
  // State and refs
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiReady, setAiReady] = useState(true); // Set true for now, replace with actual system status
  const [systemStatus, setSystemStatus] = useState("AI system ready");
  const [expandedThinking, setExpandedThinking] = useState<number | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Chat settings context
  const { ttsEnabled, setTtsEnabled, voices, selectedVoice, setSelectedVoice } = useChatSettings();

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Resize input
  const resizeInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    resizeInput();
  }, [input, resizeInput]);

  // Handle send
  const handleSend = useCallback((inputText?: string) => {
    const finalInput = inputText || input.trim();
    if (!finalInput) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: finalInput }
    ]);
    setInput("");
    setIsLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Echo: ${finalInput}`,
          thinkingSteps: [
            { step: "1", description: "Thinking...", timestamp: Date.now() }
          ]
        }
      ]);
      setIsLoading(false);
    }, 1200);
  }, [input]);

  // Toggle thinking steps
  const toggleThinking = (idx: number) => {
    setExpandedThinking((prev) => (prev === idx ? null : idx));
  };

  // Render message content
  const renderMessageContent = (msg: Message) => {
    if (msg.contentBlocks) {
      return (
        <>
          {msg.contentBlocks.textBlocks?.map((tb) => (
            <p key={tb.id} className="mb-2 last:mb-0">{tb.content}</p>
          ))}
          {msg.contentBlocks.codeBlocks?.map((cb) => (
            <pre key={cb.id} className="bg-slate-100 dark:bg-slate-800 rounded p-3 mt-2 overflow-x-auto">
              <code>{cb.code}</code>
            </pre>
          ))}
        </>
      );
    }
    return <p>{msg.content}</p>;
  };

  // Landing page with suggestions
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
              <div className={`h-2 w-2 rounded-full ${aiReady ? "bg-green-500" : "bg-yellow-500"}`}></div>
              <span className="text-slate-500 dark:text-slate-400">{systemStatus}</span>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
              <Card
                key={idx}
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-indigo-500 dark:hover:border-indigo-400"
                onClick={() => !isLoading && aiReady && handleSend(suggestion.prompt)}
              >
                <div className="space-y-2">
                  <div className="text-3xl">{suggestion.icon}</div>
                  <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{suggestion.prompt}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Input Area */}
          <Card className="p-6 shadow-xl">
            <ChatInput
              placeholder="Ask me anything about React, Next.js, TypeScript, programming..."
              onSend={handleSend}
              disabled={!aiReady || isLoading}
              onTTS={() => setTtsEnabled(!ttsEnabled)}
              ttsEnabled={ttsEnabled}
              voices={voices}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
            />
          </Card>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              ZacAi Atomic
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${aiReady ? "bg-green-500" : "bg-yellow-500"}`}></div>
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
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <article
                className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : msg.role === "assistant"
                      ? "bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
                      : "bg-red-500 text-white"
                }`}
              >
                <div className="text-xs font-semibold opacity-70 mb-3 flex items-center gap-2">
                  {msg.role === "user"
                    ? "You"
                    : msg.role === "assistant"
                      ? "AI Assistant"
                      : "Error"}
                  {msg.role === "assistant" && (
                    <button
                      className="ml-2 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                      aria-label="Listen to response"
                      onClick={() => {
                        setPlayingMsgId(msg.id);
                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          const utter = new window.SpeechSynthesisUtterance(msg.content);
                          // Voice selection logic
                          if (selectedVoice) utter.voice = selectedVoice;
                          if (selectedVoice && selectedVoice.name === 'Male American (Presenter)') {
                            const male = voices.find(v => v.lang === 'en-US' && v.name && v.name.toLowerCase().match(/(mike|john|male|dan|matt|david|paul|alex|tom)/));
                            if (male) utter.voice = male;
                          }
                          if (selectedVoice && selectedVoice.name === 'Modern Robot') {
                            const robot = voices.find(v => v.name && v.name.toLowerCase().match(/robot|synthetic|bot/));
                            if (robot) utter.voice = robot;
                          }
                          window.speechSynthesis.speak(utter);
                          utter.onend = () => setPlayingMsgId(null);
                        }
                      }}
                    >
                      <Volume2 className="w-5 h-5 text-green-600" />
                    </button>
                  )}
                {/* ...existing code... */}
                </div>
                {renderMessageContent(msg)}

                {msg.role === "assistant" &&
                  msg.thinkingSteps &&
                  msg.thinkingSteps.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleThinking(idx)}
                        className="mt-4 w-full flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="font-medium">
                          AI Thinking Process ({msg.thinkingSteps.length} steps)
                        </span>
                        {expandedThinking === idx ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {expandedThinking === idx && (
                        <div className="mt-3 space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                          {msg.thinkingSteps.map((step, stepIdx) => (
                            <div
                              key={stepIdx}
                              className="border-l-2 border-indigo-600 pl-3 py-1"
                            >
                              <div className="font-medium text-indigo-700 dark:text-indigo-400 text-xs">
                                {step.description}
                              </div>
                              <div className="opacity-60 text-xs mt-1">
                                {step.timestamp}ms
                              </div>
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
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    AI is thinking...
                  </span>
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
              handleSend();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={!aiReady}
              inputMode="text"
              enterKeyHint="send"
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              rows={1}
              onInput={resizeInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              type="submit"
              disabled={!aiReady || isLoading || !input.trim()}
              size="lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
