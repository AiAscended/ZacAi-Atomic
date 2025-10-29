"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { CodeBlock } from "@/components/code/CodeBlock"

interface Message {
  role: "user" | "assistant"
  content: string
  thinkingSteps?: Array<{
    step: string
    description: string
    timestamp: number
    data?: Record<string, unknown>
  }>
  codeBlocks?: Array<{
    id: string
    language: string
    code: string
    filename?: string
  }>
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<string>("Initializing AI system...")
  const [aiReady, setAiReady] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [expandedThinking, setExpandedThinking] = useState<number | null>(null)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log("[v0] Starting AI initialization...")
        setSystemStatus("Connecting to AI system...")

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "initialize" }),
        })

        console.log("[v0] Initialize response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Initialize failed:", errorText)
          throw new Error(`Failed to initialize: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] Initialize data:", data)

        if (data && data.sessionId) {
          setSessionId(data.sessionId)
          setAiReady(true)
          setSystemStatus("AI system ready")
          console.log("[v0] AI system initialized successfully")
        }
      } catch (error) {
        console.error("[v0] Failed to initialize AI:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setSystemStatus(`Failed to initialize: ${errorMessage}`)
      }
    }

    initializeSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("[v0] Form submitted, input:", input)

    if (!input.trim() || !aiReady || isLoading) {
      console.log("[v0] Submit blocked - input:", input.trim(), "aiReady:", aiReady, "isLoading:", isLoading)
      return
    }

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      console.log("[v0] Sending prompt to API:", userMessage)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          message: userMessage,
          sessionId,
          context: { history: messages },
        }),
      })

      console.log("[v0] Chat response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Chat failed:", errorText)
        throw new Error(`Failed to get response: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] AI response data:", data)

      if (data && data.text) {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
        const codeBlocks: Message["codeBlocks"] = []
        let match
        let blockId = 0

        while ((match = codeBlockRegex.exec(data.text)) !== null) {
          codeBlocks.push({
            id: `code-${blockId++}`,
            language: match[1] || "text",
            code: match[2].trim(),
          })
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text,
            thinkingSteps: data.metadata?.thinkingSteps,
            codeBlocks,
          },
        ])
      } else {
        throw new Error("Invalid response from AI")
      }
    } catch (error) {
      console.error("[v0] Error processing message:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorMessage}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const renderMessageContent = (msg: Message) => {
    if (!msg.codeBlocks || msg.codeBlocks.length === 0) {
      return <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
    }

    // Split content by code blocks and render
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    let match
    let blockIdx = 0

    while ((match = codeBlockRegex.exec(msg.content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = msg.content.substring(lastIndex, match.index).trim()
        if (textContent) {
          parts.push(
            <div key={`text-${blockIdx}`} className="text-sm whitespace-pre-wrap mb-3">
              {textContent}
            </div>,
          )
        }
      }

      // Add code block
      if (msg.codeBlocks[blockIdx]) {
        parts.push(
          <CodeBlock
            key={msg.codeBlocks[blockIdx].id}
            code={msg.codeBlocks[blockIdx].code}
            language={msg.codeBlocks[blockIdx].language}
            filename={msg.codeBlocks[blockIdx].filename}
            className="mb-3"
          />,
        )
      }

      lastIndex = match.index + match[0].length
      blockIdx++
    }

    // Add remaining text
    if (lastIndex < msg.content.length) {
      const textContent = msg.content.substring(lastIndex).trim()
      if (textContent) {
        parts.push(
          <div key={`text-final`} className="text-sm whitespace-pre-wrap">
            {textContent}
          </div>,
        )
      }
    }

    return <>{parts}</>
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-4xl p-6 shadow-xl">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">ZacAi Atomic</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Hybrid Multi-Domain Modular AI Assistant</p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${aiReady ? "bg-green-500" : "bg-yellow-500"}`} />
            <span className="text-xs text-slate-500">{systemStatus}</span>
          </div>
        </div>

        <div className="mb-4 h-[500px] space-y-4 overflow-y-auto rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <p>Start a conversation with the AI assistant...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  <div className="mb-1 text-xs font-semibold opacity-70">
                    {msg.role === "user" ? "You" : "AI Assistant"}
                  </div>
                  {renderMessageContent(msg)}

                  {msg.role === "assistant" && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                    <div className="mt-3 border-t border-slate-200 pt-2 dark:border-slate-700">
                      <button
                        onClick={() => setExpandedThinking(expandedThinking === idx ? null : idx)}
                        className="flex w-full items-center justify-between text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <span className="font-medium">AI Thinking Process ({msg.thinkingSteps.length} steps)</span>
                        {expandedThinking === idx ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {expandedThinking === idx && (
                        <div className="mt-2 space-y-2 rounded bg-slate-50 p-2 dark:bg-slate-900">
                          {msg.thinkingSteps.map((step, stepIdx) => (
                            <div key={stepIdx} className="border-l-2 border-blue-500 pl-2">
                              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {step.description}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{step.timestamp}ms</div>
                              {step.data && (
                                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                  {JSON.stringify(step.data, null, 2)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-white px-4 py-2 dark:bg-slate-800">
                <div className="text-sm text-slate-500">AI is thinking...</div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={!aiReady || isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!aiReady || isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  )
}
