/**
 * File: src/ai/orchestration/stateManager.ts
 * 
 * State Manager for ZacAi-Atomic
 * Maintains system state, session context, and conversation history
 * 
 * Responsibilities:
 * - Session state persistence
 * - Conversation history management
 * - Context caching
 * - State synchronization across components
 * - Recovery on system restart
 */

import { logger } from "./logger"

/**
 * Session state interface
 */
export interface SessionState {
  sessionId: string
  userId?: string
  conversationHistory: Message[]
  context: Record<string, unknown>
  metadata: {
    createdAt: number
    lastActivity: number
    messageCount: number
    totalTokens: number
  }
  preferences?: {
    theme?: "light" | "dark"
    language?: string
    verbosity?: "concise" | "detailed"
  }
}

/**
 * Message in conversation history
 */
export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  tokens?: number
  metadata?: Record<string, unknown>
}

/**
 * System state interface
 */
export interface SystemState {
  initialized: boolean
  modelsLoaded: string[]
  domainsRegistered: string[]
  uptime: number
  totalSessions: number
  activeConnections: number
  healthStatus: "healthy" | "degraded" | "unhealthy"
}

/**
 * State Manager Class
 */
export class StateManager {
  private sessions: Map<string, SessionState> = new Map()
  private systemState: SystemState
  private maxSessionHistory = 50 // Maximum messages per session
  private sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.systemState = {
      initialized: false,
      modelsLoaded: [],
      domainsRegistered: [],
      uptime: 0,
      totalSessions: 0,
      activeConnections: 0,
      healthStatus: "healthy",
    }

    this.startCleanupInterval()
  }

  /**
   * Initialize a new session
   */
  public initializeSession(sessionId: string, userId?: string): SessionState {
    const session: SessionState = {
      sessionId,
      userId,
      conversationHistory: [],
      context: {},
      metadata: {
        createdAt: Date.now(),
        lastActivity: Date.now(),
        messageCount: 0,
        totalTokens: 0,
      },
      preferences: {
        theme: "light",
        language: "en",
        verbosity: "detailed",
      },
    }

    this.sessions.set(sessionId, session)
    this.systemState.totalSessions++
    this.systemState.activeConnections++

    logger.info("Session initialized", { sessionId, userId })

    return session
  }

  /**
   * Get session state
   */
  public getSession(sessionId: string): SessionState | null {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      logger.info("Session not found", { sessionId })
      return null
    }

    // Update last activity
    session.metadata.lastActivity = Date.now()
    
    return session
  }

  /**
   * Update session with new message
   */
  public addMessage(
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
    tokens?: number,
    metadata?: Record<string, unknown>
  ): void {
    const session = this.getSession(sessionId)
    
    if (!session) {
      logger.info("Cannot add message: session not found", { sessionId })
      return
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
      tokens,
      metadata,
    }

    session.conversationHistory.push(message)
    session.metadata.messageCount++
    session.metadata.lastActivity = Date.now()
    
    if (tokens) {
      session.metadata.totalTokens += tokens
    }

    // Prune old messages if history is too long
    if (session.conversationHistory.length > this.maxSessionHistory) {
      session.conversationHistory = session.conversationHistory.slice(-this.maxSessionHistory)
    }

    logger.info("Message added to session", {
      sessionId,
      role,
      messageCount: session.metadata.messageCount,
    })
  }

  /**
   * Get conversation history for session
   */
  public getConversationHistory(sessionId: string, limit?: number): Message[] {
    const session = this.getSession(sessionId)
    
    if (!session) {
      return []
    }

    const history = session.conversationHistory
    
    if (limit && limit > 0) {
      return history.slice(-limit)
    }

    return history
  }

  /**
   * Update session context
   */
  public updateContext(sessionId: string, context: Record<string, unknown>): void {
    const session = this.getSession(sessionId)
    
    if (!session) {
      return
    }

    session.context = { ...session.context, ...context }
    session.metadata.lastActivity = Date.now()

    logger.info("Session context updated", { sessionId })
  }

  /**
   * Get session context
   */
  public getContext(sessionId: string): Record<string, unknown> {
    const session = this.getSession(sessionId)
    return session?.context || {}
  }

  /**
   * Update user preferences
   */
  public updatePreferences(
    sessionId: string,
    preferences: Partial<SessionState["preferences"]>
  ): void {
    const session = this.getSession(sessionId)
    
    if (!session) {
      return
    }

    session.preferences = { ...session.preferences, ...preferences }
    logger.info("User preferences updated", { sessionId, preferences })
  }

  /**
   * End session
   */
  public endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    
    if (session) {
      this.sessions.delete(sessionId)
      this.systemState.activeConnections = Math.max(0, this.systemState.activeConnections - 1)
      
      logger.info("Session ended", {
        sessionId,
        duration: Date.now() - session.metadata.createdAt,
        messageCount: session.metadata.messageCount,
      })
    }
  }

  /**
   * Update system state
   */
  public updateSystemState(updates: Partial<SystemState>): void {
    this.systemState = { ...this.systemState, ...updates }
    logger.info("System state updated", { updates })
  }

  /**
   * Get current system state
   */
  public getSystemState(): SystemState {
    return { ...this.systemState }
  }

  /**
   * Get all active sessions
   */
  public getActiveSessions(): SessionState[] {
    return Array.from(this.sessions.values())
  }

  /**
   * Get session count
   */
  public getSessionCount(): number {
    return this.sessions.size
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now()
    const expired: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      const idle = now - session.metadata.lastActivity
      
      if (idle > this.sessionTimeout) {
        expired.push(sessionId)
      }
    }

    for (const sessionId of expired) {
      this.endSession(sessionId)
    }

    if (expired.length > 0) {
      logger.info(`Cleaned up ${expired.length} expired sessions`, {})
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, 60 * 60 * 1000)
  }

  /**
   * Stop cleanup interval
   */
  public stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Export session state for persistence
   */
  public exportSession(sessionId: string): string | null {
    const session = this.getSession(sessionId)
    
    if (!session) {
      return null
    }

    return JSON.stringify(session)
  }

  /**
   * Import session state from persistence
   */
  public importSession(sessionData: string): boolean {
    try {
      const session = JSON.parse(sessionData) as SessionState
      this.sessions.set(session.sessionId, session)
      this.systemState.activeConnections++
      
      logger.info("Session imported", { sessionId: session.sessionId })
      return true
    } catch (error) {
      logger.info("Failed to import session", { error })
      return false
    }
  }

  /**
   * Clear all sessions (for testing/reset)
   */
  public clearAllSessions(): void {
    this.sessions.clear()
    this.systemState.activeConnections = 0
    logger.info("All sessions cleared", {})
  }

  /**
   * Get system health status
   */
  public getHealthStatus(): {
    status: "healthy" | "degraded" | "unhealthy"
    activeSessions: number
    systemUptime: number
    modelsLoaded: number
    domainsRegistered: number
  } {
    return {
      status: this.systemState.healthStatus,
      activeSessions: this.sessions.size,
      systemUptime: this.systemState.uptime,
      modelsLoaded: this.systemState.modelsLoaded.length,
      domainsRegistered: this.systemState.domainsRegistered.length,
    }
  }
}

// Export singleton instance
export const stateManager = new StateManager()
