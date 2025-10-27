import { createElement, appendChildren } from "@utils/dom"
import { generateId } from "@utils/utils"
import { getFromStorage, setToStorage } from "@utils/storage"
import { createChatMessage, createWelcomeMessage, type Message } from "./ChatMessage"
import { createChatInput, updateChatInputState } from "./ChatInput"
import { promptHandler } from "../../ai/orchestration/promptHandler"

const STORAGE_KEY = "zacai-chat-messages"

export class ChatInterface {
  private container: HTMLElement
  private messagesContainer: HTMLElement
  private inputContainer: HTMLElement
  private messages: Message[] = []
  private sessionId: string

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body
    this.messagesContainer = createElement("div", "chat-messages")
    this.inputContainer = createElement("div")

    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.loadMessages()
    this.render()
  }

  private loadMessages(): void {
    const stored = getFromStorage<Message[]>(STORAGE_KEY, [])
    this.messages = (stored as Message[]).map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  }

  private saveMessages(): void {
    setToStorage(STORAGE_KEY, this.messages)
  }

  private render(): void {
    this.container.innerHTML = ""

    const chatContainer = createElement("div", "chat-container")

    this.messagesContainer.innerHTML = ""
    if (this.messages.length === 0) {
      this.messagesContainer.appendChild(createWelcomeMessage())
    } else {
      this.messages.forEach((message) => {
        this.messagesContainer.appendChild(createChatMessage(message))
      })
    }

    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
    }, 0)

    this.inputContainer.innerHTML = ""
    const input = createChatInput({
      placeholder: "Type your message...",
      onSend: (content) => this.handleSendMessage(content),
    })
    this.inputContainer.appendChild(input)

    appendChildren(chatContainer, this.messagesContainer, this.inputContainer)
    this.container.appendChild(chatContainer)
  }

  private async handleSendMessage(content: string): Promise<void> {
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    this.messages.push(userMessage)
    this.saveMessages()
    this.render()

    updateChatInputState(this.inputContainer, true, "AI is thinking...")

    await this.simulateAIResponse(content)

    this.render()
  }

  private async simulateAIResponse(userMessage: string): Promise<void> {
    try {
      console.log("[ChatInterface] Processing prompt through AI orchestrator...")

      // Use real AI orchestrator through prompt handler
      const response = await promptHandler.handlePrompt(userMessage, this.sessionId)

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        metadata: {
          confidence: response.confidence,
          domains: response.domains,
          sources: response.sources,
        },
      }

      this.messages.push(assistantMessage)
      this.saveMessages()

      console.log("[ChatInterface] AI response received:", {
        domains: response.domains,
        confidence: response.confidence,
        sources: response.sources.length,
      })
    } catch (error) {
      console.error("[ChatInterface] Error getting AI response:", error)

      // Fallback error message
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        metadata: { error: true },
      }

      this.messages.push(errorMessage)
      this.saveMessages()
    }
  }

  public clearMessages(): void {
    this.messages = []
    this.saveMessages()
    this.render()
  }

  public getMessageCount(): number {
    return this.messages.length
  }
}
