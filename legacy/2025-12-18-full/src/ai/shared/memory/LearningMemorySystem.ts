/**
 * File: src/ai/shared/memory/LearningMemorySystem.ts
 * Description: Comprehensive learning and memory system with session management,
 * learned vocabulary storage, short/long-term memory, and date-stamped persistence.
 *
 * Features:
 * - Session-based context management
 * - Real-time learned vocabulary storage
 * - Short-term memory (current session)
 * - Long-term memory (persistent across sessions)
 * - Date-stamped learning events
 * - Automatic archival after 21 days
 * - Domain-specific learning storage
 */

import fs from "fs";
import path from "path";

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface SessionData {
  sessionId: string;
  userId?: string;
  userName?: string;
  createdAt: string; // ISO date
  lastActive: string; // ISO date
  expiresAt: string; // ISO date
  conversationHistory: ConversationTurn[];
  userContext: Record<string, unknown>;
  learnedThisSession: LearnedItem[];
  metadata: SessionMetadata;
}

export interface ConversationTurn {
  timestamp: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    intent?: string;
    sentiment?: string;
    entitiesExtracted?: string[];
    domainsInvolved?: string[];
  };
}

export interface SessionMetadata {
  totalTurns: number;
  totalTokensUsed: number;
  domainsUsed: string[];
  modelsUsed: string[];
  learningEvents: number;
}

export interface LearnedItem {
  id: string;
  timestamp: string; // ISO date with time
  domain: string;
  category:
    | "vocabulary"
    | "concept"
    | "equation"
    | "fact"
    | "procedure"
    | "other";
  term: string;
  definition: string;
  source: string; // URL or reference
  context: string; // How it was learned
  examples?: string[];
  relatedTerms?: string[];
  confidence: number; // 0-1
  verified: boolean;
  sessionId: string;
  learnedFrom: "url-lookup" | "user-input" | "inference" | "search";
}

export interface LearnedDataFile {
  domain: string;
  createdAt: string;
  lastUpdated: string;
  totalItems: number;
  items: LearnedItem[];
}

// ============================================================================
// Learning Memory System Class
// ============================================================================

export class LearningMemorySystem {
  private static instance: LearningMemorySystem;

  // In-memory storage
  private activeSessions: Map<string, SessionData> = new Map();
  private shortTermMemory: Map<string, LearnedItem[]> = new Map(); // sessionId -> items
  private longTermMemory: Map<string, LearnedItem[]> = new Map(); // domain -> items

  // File paths
  private readonly SESSION_DIR = path.join(process.cwd(), "data", "sessions");
  private readonly LEARNED_DIR = path.join(process.cwd(), "data", "learned");
  private readonly ARCHIVE_DIR = path.join(process.cwd(), "data", "archive");

  // Configuration
  private readonly SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly ARCHIVE_THRESHOLD_DAYS = 21;
  private readonly MAX_ACTIVE_SESSIONS = 100;

  private constructor() {
    this.ensureDirectories();
    this.loadActiveSessions();
    this.loadLongTermMemory();
  }

  public static getInstance(): LearningMemorySystem {
    if (!LearningMemorySystem.instance) {
      LearningMemorySystem.instance = new LearningMemorySystem();
    }
    return LearningMemorySystem.instance;
  }

  // ============================================================================
  // Directory Management
  // ============================================================================

  private ensureDirectories(): void {
    const dirs = [
      this.SESSION_DIR,
      this.LEARNED_DIR,
      this.ARCHIVE_DIR,
      path.join(this.SESSION_DIR, "current"),
      path.join(this.SESSION_DIR, "archived"),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Create a new session with optional user context
   */
  public createSession(userId?: string, userName?: string): SessionData {
    const sessionId = this.generateSessionId();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + this.SESSION_TTL_MS).toISOString();

    const session: SessionData = {
      sessionId,
      userId,
      userName,
      createdAt: now,
      lastActive: now,
      expiresAt,
      conversationHistory: [],
      userContext: userName ? { userName } : {},
      learnedThisSession: [],
      metadata: {
        totalTurns: 0,
        totalTokensUsed: 0,
        domainsUsed: [],
        modelsUsed: [],
        learningEvents: 0,
      },
    };

    this.activeSessions.set(sessionId, session);
    this.shortTermMemory.set(sessionId, []);
    this.saveSessionToFile(session);

    console.log(
      `✅ Created session: ${sessionId} ${userName ? `for ${userName}` : ""}`,
    );

    return session;
  }

  /**
   * Get existing session or create new one
   */
  public getOrCreateSession(
    sessionId?: string,
    userName?: string,
  ): SessionData {
    if (sessionId && this.activeSessions.has(sessionId)) {
      const session = this.activeSessions.get(sessionId)!;
      session.lastActive = new Date().toISOString();
      return session;
    }

    return this.createSession(undefined, userName);
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): SessionData | null {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActive = new Date().toISOString();
      return session;
    }
    return null;
  }

  /**
   * Add conversation turn to session
   */
  public addConversationTurn(
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: ConversationTurn["metadata"],
  ): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const turn: ConversationTurn = {
      timestamp: new Date().toISOString(),
      role,
      content,
      metadata,
    };

    session.conversationHistory.push(turn);
    session.metadata.totalTurns++;

    if (metadata?.domainsInvolved) {
      metadata.domainsInvolved.forEach((domain) => {
        if (!session.metadata.domainsUsed.includes(domain)) {
          session.metadata.domainsUsed.push(domain);
        }
      });
    }

    this.saveSessionToFile(session);
  }

  /**
   * Get conversation history for context
   */
  public getConversationHistory(
    sessionId: string,
    lastN?: number,
  ): ConversationTurn[] {
    const session = this.getSession(sessionId);
    if (!session) return [];

    const history = session.conversationHistory;
    return lastN ? history.slice(-lastN) : history;
  }

  /**
   * Update user context (e.g., remember user's name)
   */
  public updateUserContext(
    sessionId: string,
    key: string,
    value: unknown,
  ): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    session.userContext[key] = value;

    // Special handling for userName
    if (key === "userName" && typeof value === "string") {
      session.userName = value;
    }

    this.saveSessionToFile(session);
  }

  /**
   * Get user context value
   */
  public getUserContext(sessionId: string, key: string): unknown {
    const session = this.getSession(sessionId);
    return session?.userContext[key];
  }

  // ============================================================================
  // Learning System
  // ============================================================================

  /**
   * Store a newly learned item (vocabulary, concept, fact, etc.)
   */
  public learnItem(
    sessionId: string,
    domain: string,
    category: LearnedItem["category"],
    term: string,
    definition: string,
    source: string,
    context: string,
    options?: {
      examples?: string[];
      relatedTerms?: string[];
      confidence?: number;
      verified?: boolean;
      learnedFrom?: LearnedItem["learnedFrom"];
    },
  ): LearnedItem {
    const item: LearnedItem = {
      id: this.generateLearnedItemId(),
      timestamp: new Date().toISOString(),
      domain,
      category,
      term,
      definition,
      source,
      context,
      examples: options?.examples || [],
      relatedTerms: options?.relatedTerms || [],
      confidence: options?.confidence || 0.7,
      verified: options?.verified || false,
      sessionId,
      learnedFrom: options?.learnedFrom || "inference",
    };

    // Store in short-term memory (session)
    const sessionItems = this.shortTermMemory.get(sessionId) || [];
    sessionItems.push(item);
    this.shortTermMemory.set(sessionId, sessionItems);

    // Store in long-term memory (domain)
    const domainItems = this.longTermMemory.get(domain) || [];
    domainItems.push(item);
    this.longTermMemory.set(domain, domainItems);

    // Update session
    const session = this.getSession(sessionId);
    if (session) {
      session.learnedThisSession.push(item);
      session.metadata.learningEvents++;
      this.saveSessionToFile(session);
    }

    // Save to domain-specific learned file
    this.saveLearnedItem(domain, item);

    console.log(
      `📚 Learned new ${category}: "${term}" in ${domain} (from ${item.learnedFrom})`,
    );

    return item;
  }

  /**
   * Check if term is already known
   */
  public isKnown(domain: string, term: string): boolean {
    const domainItems = this.longTermMemory.get(domain) || [];
    return domainItems.some(
      (item) => item.term.toLowerCase() === term.toLowerCase(),
    );
  }

  /**
   * Retrieve learned item by term
   */
  public retrieveLearnedItem(domain: string, term: string): LearnedItem | null {
    const domainItems = this.longTermMemory.get(domain) || [];
    return (
      domainItems.find(
        (item) => item.term.toLowerCase() === term.toLowerCase(),
      ) || null
    );
  }

  /**
   * Get all items learned in a session
   */
  public getSessionLearning(sessionId: string): LearnedItem[] {
    return this.shortTermMemory.get(sessionId) || [];
  }

  /**
   * Get all items learned in a domain
   */
  public getDomainLearning(domain: string): LearnedItem[] {
    return this.longTermMemory.get(domain) || [];
  }

  // ============================================================================
  // File Persistence
  // ============================================================================

  /**
   * Save session to file with date stamp
   */
  private saveSessionToFile(session: SessionData): void {
    try {
      const filename = `session_${session.sessionId}_${this.getDateStamp()}.json`;
      const filepath = path.join(this.SESSION_DIR, "current", filename);

      fs.writeFileSync(filepath, JSON.stringify(session, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  /**
   * Save learned item to domain-specific file
   */
  private saveLearnedItem(domain: string, item: LearnedItem): void {
    try {
      const domainDir = path.join(this.LEARNED_DIR, domain);
      if (!fs.existsSync(domainDir)) {
        fs.mkdirSync(domainDir, { recursive: true });
      }

      const filename = `${domain}_learned_${this.getDateStamp()}.json`;
      const filepath = path.join(domainDir, filename);

      let data: LearnedDataFile;

      if (fs.existsSync(filepath)) {
        // Append to existing file
        const existing = JSON.parse(fs.readFileSync(filepath, "utf-8"));
        data = existing;
        data.items.push(item);
        data.totalItems = data.items.length;
        data.lastUpdated = new Date().toISOString();
      } else {
        // Create new file
        data = {
          domain,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          totalItems: 1,
          items: [item],
        };
      }

      fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving learned item:", error);
    }
  }

  /**
   * Load active sessions from disk
   */
  private loadActiveSessions(): void {
    try {
      const currentDir = path.join(this.SESSION_DIR, "current");
      if (!fs.existsSync(currentDir)) return;

      const files = fs.readdirSync(currentDir);
      const now = Date.now();

      files.forEach((file) => {
        if (!file.endsWith(".json")) return;

        const filepath = path.join(currentDir, file);
        const session = JSON.parse(
          fs.readFileSync(filepath, "utf-8"),
        ) as SessionData;

        // Check if session is expired
        const expiresAt = new Date(session.expiresAt).getTime();
        if (expiresAt < now) {
          // Archive expired session
          this.archiveSession(session);
        } else {
          // Load active session
          this.activeSessions.set(session.sessionId, session);
          this.shortTermMemory.set(
            session.sessionId,
            session.learnedThisSession,
          );
        }
      });

      console.log(`📂 Loaded ${this.activeSessions.size} active sessions`);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  }

  /**
   * Load long-term memory from domain-specific learned files
   */
  private loadLongTermMemory(): void {
    try {
      if (!fs.existsSync(this.LEARNED_DIR)) return;

      const domains = fs.readdirSync(this.LEARNED_DIR);
      let totalItems = 0;

      domains.forEach((domain) => {
        const domainDir = path.join(this.LEARNED_DIR, domain);
        if (!fs.statSync(domainDir).isDirectory()) return;

        const files = fs.readdirSync(domainDir);
        const allItems: LearnedItem[] = [];

        files.forEach((file) => {
          if (!file.endsWith(".json")) return;

          const filepath = path.join(domainDir, file);
          const data = JSON.parse(
            fs.readFileSync(filepath, "utf-8"),
          ) as LearnedDataFile;
          allItems.push(...data.items);
        });

        this.longTermMemory.set(domain, allItems);
        totalItems += allItems.length;
      });

      console.log(
        `📚 Loaded ${totalItems} learned items across ${domains.length} domains`,
      );
    } catch (error) {
      console.error("Error loading long-term memory:", error);
    }
  }

  /**
   * Archive old session
   */
  private archiveSession(session: SessionData): void {
    try {
      const currentPath = path.join(
        this.SESSION_DIR,
        "current",
        `session_${session.sessionId}_${this.getDateStamp()}.json`,
      );
      const archivePath = path.join(
        this.SESSION_DIR,
        "archived",
        `session_${session.sessionId}_${this.getDateStamp()}.json`,
      );

      if (fs.existsSync(currentPath)) {
        fs.renameSync(currentPath, archivePath);
      }

      this.activeSessions.delete(session.sessionId);
      this.shortTermMemory.delete(session.sessionId);

      console.log(`📦 Archived session: ${session.sessionId}`);
    } catch (error) {
      console.error("Error archiving session:", error);
    }
  }

  /**
   * Archive old learned data (older than threshold)
   */
  public archiveOldLearning(): void {
    try {
      const threshold =
        Date.now() - this.ARCHIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

      Object.keys(this.LEARNED_DIR).forEach((domain) => {
        const domainDir = path.join(this.LEARNED_DIR, domain);
        if (!fs.existsSync(domainDir)) return;

        const files = fs.readdirSync(domainDir);

        files.forEach((file) => {
          if (!file.endsWith(".json")) return;

          const filepath = path.join(domainDir, file);
          const stats = fs.statSync(filepath);

          if (stats.mtimeMs < threshold) {
            const archiveDir = path.join(this.ARCHIVE_DIR, domain);
            if (!fs.existsSync(archiveDir)) {
              fs.mkdirSync(archiveDir, { recursive: true });
            }

            const archivePath = path.join(archiveDir, file);
            fs.renameSync(filepath, archivePath);
            console.log(`📦 Archived old learning: ${file}`);
          }
        });
      });
    } catch (error) {
      console.error("Error archiving old learning:", error);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLearnedItemId(): string {
    return `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get date stamp in DD-MM-YY format
   */
  private getDateStamp(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const activeSessions = this.activeSessions.size;
    const totalLearned = Array.from(this.longTermMemory.values()).reduce(
      (sum, items) => sum + items.length,
      0,
    );

    return {
      activeSessions,
      totalLearnedItems: totalLearned,
      domainsCovered: this.longTermMemory.size,
      sessionTTL: this.SESSION_TTL_MS,
      archiveThresholdDays: this.ARCHIVE_THRESHOLD_DAYS,
    };
  }

  /**
   * Clean up expired sessions
   */
  public cleanupExpiredSessions(): void {
    const now = Date.now();
    const expired: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      const expiresAt = new Date(session.expiresAt).getTime();
      if (expiresAt < now) {
        expired.push(sessionId);
      }
    });

    expired.forEach((sessionId) => {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        this.archiveSession(session);
      }
    });

    console.log(`🧹 Cleaned up ${expired.length} expired sessions`);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const learningMemory = LearningMemorySystem.getInstance();
