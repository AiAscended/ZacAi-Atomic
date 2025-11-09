/**
 * Learning & Memory System
 * Manages real-time knowledge acquisition, session memory, and long-term storage
 * Features:
 * - Session-based short-term memory with context preservation
 * - Real-time vocabulary/concept learning with date stamps
 * - Automatic archival after 21 days
 * - GitHub backup integration
 * - Domain-specific learned data storage
 */

import { promises as fs } from "fs";
import * as path from "path";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LearnedConcept {
  term: string;
  definition: string;
  domain: string;
  source: string; // URL or reference
  examples?: string[];
  relatedTerms?: string[];
  confidence: number;
  learnedAt: string; // ISO timestamp
  lastAccessed: string;
  accessCount: number;
  sessionId: string;
  context?: string; // Original context where it was learned
}

export interface SessionMemory {
  sessionId: string;
  userId?: string;
  userName?: string;
  userPreferences?: Record<string, unknown>;
  conversationHistory: ConversationTurn[];
  learnedConcepts: string[]; // IDs of concepts learned in this session
  createdAt: string;
  lastActive: string;
  metadata: Record<string, unknown>;
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  domains?: string[];
  concepts?: string[]; // Concepts referenced
}

export interface DomainLearned {
  domain: string;
  concepts: LearnedConcept[];
  lastUpdated: string;
  version: number;
  statistics: {
    totalConcepts: number;
    avgConfidence: number;
    lastTrainingDate?: string;
  };
}

export interface ArchiveEntry {
  originalPath: string;
  archivedAt: string;
  reason: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// MAIN LEARNING & MEMORY MANAGER
// ============================================================================

export class LearningMemoryManager {
  private basePath: string;
  private sessionsPath: string;
  private learnedPath: string;
  private archivePath: string;
  private activeSessions: Map<string, SessionMemory> = new Map();
  private archiveAfterDays: number = 21;

  constructor(basePath?: string) {
    this.basePath =
      basePath || path.join(__dirname, "../../../data/learning-memory");
    this.sessionsPath = path.join(this.basePath, "sessions");
    this.learnedPath = path.join(this.basePath, "learned");
    this.archivePath = path.join(this.basePath, "archive");
  }

  /**
   * Initialize the system - create necessary directories
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.sessionsPath, { recursive: true });
    await fs.mkdir(this.learnedPath, { recursive: true });
    await fs.mkdir(this.archivePath, { recursive: true });

    // Create domain-specific learned folders
    const domains = [
      "algorithms",
      "code_review",
      "data_integrity",
      "data_structures",
      "documentation",
      "english",
      "environment",
      "error_detection",
      "general_knowledge",
      "grammar",
      "internet_search",
      "mathematics",
      "nextjs",
      "observability",
      "programming",
      "react",
      "repair",
      "science",
      "security",
      "system",
      "testing",
      "typescript",
      "version_control",
    ];

    for (const domain of domains) {
      const domainPath = path.join(this.learnedPath, domain);
      await fs.mkdir(domainPath, { recursive: true });

      // Create initial learned file if it doesn't exist
      const learnedFile = path.join(
        domainPath,
        `${domain}_learned_${this.getDateStamp()}.json`,
      );
      try {
        await fs.access(learnedFile);
      } catch {
        const initialData: DomainLearned = {
          domain,
          concepts: [],
          lastUpdated: new Date().toISOString(),
          version: 1,
          statistics: {
            totalConcepts: 0,
            avgConfidence: 0,
          },
        };
        await fs.writeFile(learnedFile, JSON.stringify(initialData, null, 2));
      }
    }

    console.log("✅ Learning & Memory System initialized");
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Create or retrieve a session
   */
  async getOrCreateSession(
    sessionId: string,
    userId?: string,
  ): Promise<SessionMemory> {
    // Check in-memory cache
    if (this.activeSessions.has(sessionId)) {
      const session = this.activeSessions.get(sessionId)!;
      session.lastActive = new Date().toISOString();
      return session;
    }

    // Try to load from disk
    const sessionFile = path.join(
      this.sessionsPath,
      `session_${sessionId}.json`,
    );
    try {
      const data = await fs.readFile(sessionFile, "utf-8");
      const session: SessionMemory = JSON.parse(data);
      session.lastActive = new Date().toISOString();
      this.activeSessions.set(sessionId, session);
      return session;
    } catch {
      // Create new session
      const session: SessionMemory = {
        sessionId,
        userId,
        conversationHistory: [],
        learnedConcepts: [],
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        metadata: {},
      };
      this.activeSessions.set(sessionId, session);
      await this.saveSession(session);
      return session;
    }
  }

  /**
   * Add a conversation turn to session
   */
  async addConversationTurn(
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
    domains?: string[],
    concepts?: string[],
  ): Promise<void> {
    const session = await this.getOrCreateSession(sessionId);

    const turn: ConversationTurn = {
      role,
      content,
      timestamp: new Date().toISOString(),
      domains,
      concepts,
    };

    session.conversationHistory.push(turn);
    session.lastActive = new Date().toISOString();

    await this.saveSession(session);
  }

  /**
   * Update session metadata (user name, preferences, etc.)
   */
  async updateSessionMetadata(
    sessionId: string,
    updates: Partial<
      Pick<SessionMemory, "userName" | "userPreferences" | "metadata">
    >,
  ): Promise<void> {
    const session = await this.getOrCreateSession(sessionId);

    if (updates.userName) session.userName = updates.userName;
    if (updates.userPreferences) {
      session.userPreferences = {
        ...session.userPreferences,
        ...updates.userPreferences,
      };
    }
    if (updates.metadata) {
      session.metadata = { ...session.metadata, ...updates.metadata };
    }

    await this.saveSession(session);
  }

  /**
   * Get session context (recent conversation history)
   */
  async getSessionContext(
    sessionId: string,
    lastNTurns: number = 10,
  ): Promise<ConversationTurn[]> {
    const session = await this.getOrCreateSession(sessionId);
    return session.conversationHistory.slice(-lastNTurns);
  }

  /**
   * Save session to disk
   */
  private async saveSession(session: SessionMemory): Promise<void> {
    const sessionFile = path.join(
      this.sessionsPath,
      `session_${session.sessionId}.json`,
    );
    await fs.writeFile(sessionFile, JSON.stringify(session, null, 2));
  }

  // ============================================================================
  // LEARNING & KNOWLEDGE ACQUISITION
  // ============================================================================

  /**
   * Learn a new concept from URL lookup or discovery
   */
  async learnConcept(
    term: string,
    definition: string,
    domain: string,
    source: string,
    sessionId: string,
    options?: {
      examples?: string[];
      relatedTerms?: string[];
      context?: string;
      confidence?: number;
    },
  ): Promise<LearnedConcept> {
    const now = new Date().toISOString();

    const concept: LearnedConcept = {
      term,
      definition,
      domain,
      source,
      examples: options?.examples || [],
      relatedTerms: options?.relatedTerms || [],
      confidence: options?.confidence || 0.8,
      learnedAt: now,
      lastAccessed: now,
      accessCount: 1,
      sessionId,
      context: options?.context,
    };

    // Save to domain-specific learned file
    await this.saveToDomainLearned(domain, concept);

    // Update session
    const session = await this.getOrCreateSession(sessionId);
    session.learnedConcepts.push(`${domain}:${term}`);
    await this.saveSession(session);

    console.log(`✅ Learned new concept: "${term}" in ${domain} domain`);

    return concept;
  }

  /**
   * Save concept to domain-specific learned file
   */
  private async saveToDomainLearned(
    domain: string,
    concept: LearnedConcept,
  ): Promise<void> {
    const domainPath = path.join(this.learnedPath, domain);
    const dateStamp = this.getDateStamp();
    const learnedFile = path.join(
      domainPath,
      `${domain}_learned_${dateStamp}.json`,
    );

    let domainData: DomainLearned;

    try {
      const data = await fs.readFile(learnedFile, "utf-8");
      domainData = JSON.parse(data);
    } catch {
      // Create new file
      domainData = {
        domain,
        concepts: [],
        lastUpdated: new Date().toISOString(),
        version: 1,
        statistics: {
          totalConcepts: 0,
          avgConfidence: 0,
        },
      };
    }

    // Check if concept already exists
    const existingIndex = domainData.concepts.findIndex(
      (c) => c.term === concept.term,
    );
    if (existingIndex >= 0) {
      // Update existing
      domainData.concepts[existingIndex].accessCount++;
      domainData.concepts[existingIndex].lastAccessed =
        new Date().toISOString();
      domainData.concepts[existingIndex].confidence = Math.min(
        1.0,
        domainData.concepts[existingIndex].confidence + 0.05,
      );
    } else {
      // Add new
      domainData.concepts.push(concept);
    }

    // Update statistics
    domainData.lastUpdated = new Date().toISOString();
    domainData.statistics.totalConcepts = domainData.concepts.length;
    domainData.statistics.avgConfidence =
      domainData.concepts.reduce((sum, c) => sum + c.confidence, 0) /
      domainData.concepts.length;

    await fs.writeFile(learnedFile, JSON.stringify(domainData, null, 2));
  }

  /**
   * Retrieve learned concept
   */
  async getConcept(
    term: string,
    domain: string,
  ): Promise<LearnedConcept | null> {
    const domainPath = path.join(this.learnedPath, domain);

    // Find the latest learned file for this domain
    const files = await fs.readdir(domainPath);
    const learnedFiles = files.filter(
      (f) => f.startsWith(`${domain}_learned_`) && f.endsWith(".json"),
    );

    if (learnedFiles.length === 0) return null;

    // Sort by date (newest first)
    learnedFiles.sort().reverse();

    // Search through files
    for (const file of learnedFiles) {
      const filePath = path.join(domainPath, file);
      const data = await fs.readFile(filePath, "utf-8");
      const domainData: DomainLearned = JSON.parse(data);

      const concept = domainData.concepts.find(
        (c) => c.term.toLowerCase() === term.toLowerCase(),
      );
      if (concept) {
        // Update access stats
        concept.accessCount++;
        concept.lastAccessed = new Date().toISOString();
        await fs.writeFile(filePath, JSON.stringify(domainData, null, 2));
        return concept;
      }
    }

    return null;
  }

  /**
   * Search for concepts across domains
   */
  async searchConcepts(
    query: string,
    domains?: string[],
  ): Promise<LearnedConcept[]> {
    const results: LearnedConcept[] = [];
    const searchDomains = domains || (await this.getAllDomains());

    for (const domain of searchDomains) {
      const domainPath = path.join(this.learnedPath, domain);
      try {
        const files = await fs.readdir(domainPath);
        const learnedFiles = files.filter((f) =>
          f.startsWith(`${domain}_learned_`),
        );

        for (const file of learnedFiles) {
          const data = await fs.readFile(path.join(domainPath, file), "utf-8");
          const domainData: DomainLearned = JSON.parse(data);

          const matches = domainData.concepts.filter(
            (c) =>
              c.term.toLowerCase().includes(query.toLowerCase()) ||
              c.definition.toLowerCase().includes(query.toLowerCase()),
          );

          results.push(...matches);
        }
      } catch (error) {
        // Domain folder doesn't exist or other error
        continue;
      }
    }

    return results;
  }

  // ============================================================================
  // ARCHIVAL SYSTEM
  // ============================================================================

  /**
   * Archive old sessions and learned data
   */
  async archiveOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.archiveAfterDays);

    // Archive old sessions
    const sessionFiles = await fs.readdir(this.sessionsPath);
    for (const file of sessionFiles) {
      const filePath = path.join(this.sessionsPath, file);
      const stats = await fs.stat(filePath);

      if (stats.mtime < cutoffDate) {
        await this.archiveFile(
          filePath,
          "session",
          `Inactive for ${this.archiveAfterDays} days`,
        );
      }
    }

    // Archive old learned files
    const domains = await this.getAllDomains();
    for (const domain of domains) {
      const domainPath = path.join(this.learnedPath, domain);
      const files = await fs.readdir(domainPath);
      const learnedFiles = files.filter((f) =>
        f.startsWith(`${domain}_learned_`),
      );

      // Keep the latest 3 files, archive the rest
      if (learnedFiles.length > 3) {
        learnedFiles.sort().reverse();
        const toArchive = learnedFiles.slice(3);

        for (const file of toArchive) {
          const filePath = path.join(domainPath, file);
          await this.archiveFile(
            filePath,
            "learned",
            "Old learned data superseded by newer files",
          );
        }
      }
    }

    console.log(`✅ Archived data older than ${this.archiveAfterDays} days`);
  }

  /**
   * Archive a file
   */
  private async archiveFile(
    filePath: string,
    type: string,
    reason: string,
  ): Promise<void> {
    const fileName = path.basename(filePath);
    const archiveSubDir = path.join(this.archivePath, type);
    await fs.mkdir(archiveSubDir, { recursive: true });

    const archivePath = path.join(archiveSubDir, fileName);
    await fs.rename(filePath, archivePath);

    // Create archive entry
    const entry: ArchiveEntry = {
      originalPath: filePath,
      archivedAt: new Date().toISOString(),
      reason,
      metadata: {},
    };

    const indexFile = path.join(archiveSubDir, "archive_index.json");
    let index: ArchiveEntry[] = [];

    try {
      const data = await fs.readFile(indexFile, "utf-8");
      index = JSON.parse(data);
    } catch {
      // New index
    }

    index.push(entry);
    await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get date stamp in dd-mm-yy format
   */
  private getDateStamp(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    return `${dd}-${mm}-${yy}`;
  }

  /**
   * Get all domain names
   */
  private async getAllDomains(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.learnedPath, {
        withFileTypes: true,
      });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<unknown> {
    const stats = {
      activeSessions: this.activeSessions.size,
      totalSessionFiles: 0,
      totalLearnedConcepts: 0,
      conceptsByDomain: {} as Record<string, number>,
      archivedFiles: 0,
    };

    // Count session files
    try {
      const sessionFiles = await fs.readdir(this.sessionsPath);
      stats.totalSessionFiles = sessionFiles.length;
    } catch {}

    // Count learned concepts
    const domains = await this.getAllDomains();
    for (const domain of domains) {
      const domainPath = path.join(this.learnedPath, domain);
      try {
        const files = await fs.readdir(domainPath);
        const learnedFiles = files.filter((f) =>
          f.startsWith(`${domain}_learned_`),
        );

        let domainTotal = 0;
        for (const file of learnedFiles) {
          const data = await fs.readFile(path.join(domainPath, file), "utf-8");
          const domainData: DomainLearned = JSON.parse(data);
          domainTotal += domainData.concepts.length;
        }

        stats.conceptsByDomain[domain] = domainTotal;
        stats.totalLearnedConcepts += domainTotal;
      } catch {}
    }

    // Count archived files
    try {
      const archiveTypes = await fs.readdir(this.archivePath);
      for (const type of archiveTypes) {
        const typePath = path.join(this.archivePath, type);
        const files = await fs.readdir(typePath);
        stats.archivedFiles += files.length - 1; // Subtract index file
      }
    } catch {}

    return stats;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let learningMemoryManager: LearningMemoryManager | null = null;

export function getLearningMemoryManager(): LearningMemoryManager {
  if (!learningMemoryManager) {
    learningMemoryManager = new LearningMemoryManager();
    learningMemoryManager.initialize().catch(console.error);
  }
  return learningMemoryManager;
}
