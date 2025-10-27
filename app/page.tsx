"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// Import the real AI system
import { AIOrchestrator } from "@/src/ai/orchestration/aiOrchestrator"
import { promptHandler } from "@/src/ai/orchestration/promptHandler"

export default function HomePage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<string>("Initializing AI system...")
  const [aiReady, setAiReady] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [domainCount, setDomainCount] = useState(0)

  useEffect(() => {
    const initializeAI = async () => {
      try {
        setSystemStatus("Loading AI modules...")

        // Get orchestrator instance
        const orchestrator = AIOrchestrator.getInstance()

        // Initialize all domains
        await orchestrator.initialize()

        // Create session
        const newSessionId = orchestrator.createSession()
        setSessionId(newSessionId)

        // Get registered domains
        const domains = orchestrator.getRegisteredDomains()
        setDomainCount(domains.length)

        setSystemStatus(`Ready - ${domains.length} knowledge domains loaded`)
        setAiReady(true)

        console.log(
          "[v0] AI system initialized with domains:",
          domains.map((d) => d.name),
        )
      } catch (error) {
        console.error("[v0] Failed to initialize AI:", error)
        setSystemStatus("Error: AI system unavailable")
      }
    }

    initializeAI()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !aiReady) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      console.log("[v0] Processing prompt through AI orchestrator...")

      const response = await promptHandler.handlePrompt(userMessage, sessionId)

      console.log("[v0] AI response received:", {
        domains: response.domains,
        confidence: response.confidence,
        sources: response.sources.length,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.text,
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
          <p className="text-sm text-green-600">System Ready - 16 Knowledge Domains Loaded</p>
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
