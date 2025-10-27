"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<string>("Initializing AI system...")
  const [aiReady, setAiReady] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setSystemStatus("Connecting to AI system...")

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "initialize" }),
        })

        if (!response.ok) throw new Error("Failed to initialize")

        const data = await response.json()
        setSessionId(data.sessionId)
        setAiReady(true)
        setSystemStatus("AI system ready")
        console.log("[v0] AI system initialized via API")
      } catch (error) {
        console.error("[v0] Failed to initialize AI:", error)
        setSystemStatus("Failed to initialize AI system")
      }
    }

    initializeSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !aiReady || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      console.log("[v0] Sending prompt to API...")
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

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      console.log("[v0] AI response received:", { domains: data.domains, confidence: data.confidence })

      setMessages((prev) => [...prev, { role: "assistant", content: data.text }])
    } catch (error) {
      console.error("[v0] Error processing message:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your request." },
      ])
    } finally {
      setIsLoading(false)
    }
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
                  <div className="text-sm">{msg.content}</div>
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
