"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
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
        setSystemStatus(`Ready - ${data.domainCount} knowledge domains loaded`)
        setAiReady(true)

        console.log("[v0] AI system initialized via API")
      } catch (error) {
        console.error("[v0] Failed to initialize AI:", error)
        setSystemStatus("Error: AI system unavailable")
      }
    }

    initializeSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !aiReady) return

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
        }),
      })

      if (!response.ok) throw new Error("API request failed")

      const data = await response.json()

      console.log("[v0] AI response received:", {
        domains: data.domains,
        confidence: data.confidence,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
        },
      ])
    } catch (error) {
      console.error("[v0] Error processing prompt:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-4xl space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">ZacAi-Atomic</h1>
          <p className="text-muted-foreground">Hybrid Modular AI Assistant</p>
          <p className={`text-sm ${aiReady ? "text-green-600" : "text-yellow-600"}`}>{systemStatus}</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-20">
                <p>Start a conversation with the AI assistant</p>
                <p className="text-sm mt-2">
                  Try asking about mathematics, programming, TypeScript, science, grammar, or any topic!
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">{message.role === "user" ? "You" : "AI Assistant"}</p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="bg-muted p-4 rounded-lg mr-12">
                <p className="text-sm font-semibold mb-1">AI Assistant</p>
                <p className="text-muted-foreground">Processing with neural inference...</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading || !aiReady}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !aiReady}>
              Send
            </Button>
          </form>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>Powered by atomic modular AI architecture</p>
          <p>16 knowledge domains • Neural inference • Context-aware responses • Real-time learning</p>
        </div>
      </div>
    </div>
  )
}
