"use client"
/**
 * File: src/app/page.tsx
 * Main chat UI page component for ZacAi Atomic
 * Features:
 * - Auto-resizing textarea input with keyboard controls
 * - State management for conversation, loading and UI toggles
 * - Modular AI response rendering with text and code blocks
 * - Detailed toggleable thinking step display
 * - Session and prompt handling with backend API
 * - Light/dark theme compatibility
 */

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ResponseRenderer } from "@/components/ResponseRenderer"

interface Message {
  id: string
  role: "user" | "assistant" | "error"
  content: string
  contentBlocks?: {
    textBlocks: Array<{ id: string; content: string }>
    codeBlocks: Array<{ id: string; language: string; code: string; filename?: string }>
  }
  thinkingSteps?: Array<{
    step: string
    description: string
    timestamp: number
    data?: Record<string, unknown>
  }>
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiReady, setAiReady] = useState(false)
  const [systemStatus, setSystemStatus] = useState("Initializing AI system...")
  const [sessionId, setSessionId] = useState("")
  const [expandedThinking, setExpandedThinking] = useState<number | null>(null)

  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea input height to fit content
  const resizeInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`
    }
  }, [])

  useEffect(() => {
    resizeInput()
  }, [input, resizeInput])

  // Initialize AI session with backend
  useEffect(() => {
    async function initializeSession() {
      setSystemStatus("Connecting to AI system...")
      setIsLoading(true)
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "initialize" }),
        })
        if (!res.ok) throw new Error(`Failed to initialize AI system (${res.status})`)
        const data = await res.json()
        setSessionId(data.sessionId)
        setAiReady(true)
        setSystemStatus("AI system ready")
      } catch {
        setSystemStatus("Failed to initialize AI system")
      } finally {
        setIsLoading(false)
      }
    }
    initializeSession()
  }, [])

  // Handle prompt submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !aiReady || isLoading) return

    const userInput = input.trim()
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", content: userInput }])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", message: userInput, sessionId }),
      })
      if (!res.ok) throw new Error(`Chat request failed (${res.status})`)
      const data = await res.json()
      const assistantMessage: Message = {
        id: `assist-${Date.now()}`,
        role: "assistant",
        content: data.text,
        contentBlocks: {
          textBlocks: data.metadata?.textBlocks || [],
          codeBlocks: data.metadata?.codeBlocks || [],
        },
        thinkingSteps: data.metadata?.thinkingSteps || [],
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, role: "error", content: "Error occurred processing prompt." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle display of AI thinking steps per message
  const toggleThinking = (idx: number) => {
    setExpandedThinking((current) => (current === idx ? null : idx))
  }

  // Render message content including modular code/text or plain text
  const renderMessageContent = (msg: Message) => {
    if (msg.role === "assistant" && msg.contentBlocks) {
      // Map content blocks to include type field required by ResponseRenderer
      const textBlocks = msg.contentBlocks.textBlocks.map((block) => ({
        ...block,
        type: "paragraph" as const,
      }))
      return <ResponseRenderer textBlocks={textBlocks} codeBlocks={msg.contentBlocks.codeBlocks} />
    }
    return <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="max-w-[1200px] w-full p-6 shadow-xl flex flex-col">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">ZacAi Atomic</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Hybrid Multi-Domain Modular AI Assistant</p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${aiReady ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <span className="text-xs text-slate-500">{systemStatus}</span>
          </div>
        </header>

        <main className="flex-grow mb-4 space-y-4 overflow-y-auto rounded-lg bg-white dark:bg-slate-900 p-4">
          {messages.length === 0 ? (
            <p className="text-center text-slate-400">Start a conversation with the AI assistant...</p>
          ) : (
            messages.map((msg, idx) => (
              <article
                key={msg.id}
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "ml-auto bg-indigo-600 text-white"
                    : msg.role === "assistant"
                      ? "mr-auto bg-slate-100 dark:bg-slate-800 dark:text-white"
                      : "mr-auto bg-red-500 text-white"
                }`}
              >
                <div className="text-xs font-semibold opacity-70 mb-2">
                  {msg.role === "user" ? "You" : msg.role === "assistant" ? "AI Assistant" : "Error"}
                </div>
                {renderMessageContent(msg)}

                {msg.role === "assistant" && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleThinking(idx)}
                      className="mt-3 w-full flex justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <span className="font-medium">AI Thinking Process ({msg.thinkingSteps.length} steps)</span>
                      {expandedThinking === idx ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedThinking === idx && (
                      <div className="mt-2 space-y-2 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                        {msg.thinkingSteps.map((step, stepIdx) => (
                          <div key={stepIdx} className="border-l-2 border-indigo-600 pl-2">
                            <div className="font-medium text-indigo-700 dark:text-indigo-400 text-xs">
                              {step.description}
                            </div>
                            <div className="opacity-60 text-xs">{step.timestamp}ms</div>
                            {step.data && (
                              <pre className="text-xs mt-1 dark:text-indigo-200">
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
            ))
          )}
          {isLoading && (
            <article className="max-w-[80%] rounded-lg p-4 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 animate-pulse mr-auto select-none">
              AI is thinking...
            </article>
          )}
        </main>

        <form className="flex gap-3" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={!aiReady || isLoading}
            className="flex-1 resize-none rounded-md border border-slate-300 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={1}
            onInput={resizeInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={!aiReady || isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  )
}
