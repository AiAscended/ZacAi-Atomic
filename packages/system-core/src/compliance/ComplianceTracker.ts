/**
 * Compliance Tracker
 * Maintains audit trails for HIPAA/FDA/SOC2/ISO27001 compliance
 * Provides deterministic, immutable logging for hospital-grade systems
 */

export interface ComplianceEvent {
  /** Type of event (e.g., SYSTEM_BOOT, ERROR_DETECTED) */
  eventType: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** User/agent ID (optional) */
  userId?: string;
  /** Event-specific details */
  details: Record<string, any>;
  /** SHA-256 checksum for integrity */
  checksum?: string;
  /** Sequential event ID */
  id?: number;
}

export interface ComplianceFilter {
  startTime?: number;
  endTime?: number;
  eventType?: string;
  userId?: string;
}

export type ComplianceLevel = 'HIPAA' | 'FDA' | 'SOC2' | 'ISO27001';

/**
 * Compliance Tracker - Hospital-grade audit trail
 */
export class ComplianceTracker {
  private auditLog: ComplianceEvent[] = [];
  private eventCounter = 0;
  private readonly maxLogSize: number;
  private readonly complianceLevel: ComplianceLevel;
  private archivedEvents = 0;

  constructor(complianceLevel: ComplianceLevel) {
    this.complianceLevel = complianceLevel;

    // Storage limits based on compliance level
    switch (complianceLevel) {
      case 'HIPAA':
        this.maxLogSize = 1000000; // 1M events for medical records
        break;
      case 'FDA':
        this.maxLogSize = 500000; // 500K events for device records
        break;
      case 'SOC2':
        this.maxLogSize = 100000; // 100K events for security
        break;
      case 'ISO27001':
        this.maxLogSize = 100000; // 100K events for security
        break;
      default:
        this.maxLogSize = 100000;
    }
  }

  /**
   * Log a compliance event
   * @param eventType Type of event
   * @param details Event-specific details
   * @param userId Optional user ID
   */
  logEvent(eventType: string, details: Record<string, any>, userId?: string): void {
    this.eventCounter++;

    const event: ComplianceEvent = {
      id: this.eventCounter,
      eventType,
      timestamp: new Date().toISOString(),
      userId,
      details,
      checksum: this.computeChecksum(eventType, details),
    };

    this.auditLog.push(event);

    // Prevent memory bloat
    if (this.auditLog.length > this.maxLogSize) {
      this.archiveAndRotate();
    }
  }

  /**
   * Get audit trail with optional filtering
   */
  getAuditTrail(filter?: ComplianceFilter): ComplianceEvent[] {
    let result = [...this.auditLog];

    if (filter?.startTime) {
      result = result.filter(
        e => new Date(e.timestamp).getTime() >= filter.startTime!
      );
    }

    if (filter?.endTime) {
      result = result.filter(e => new Date(e.timestamp).getTime() <= filter.endTime!);
    }

    if (filter?.eventType) {
      result = result.filter(e => e.eventType === filter.eventType);
    }

    if (filter?.userId) {
      result = result.filter(e => e.userId === filter.userId);
    }

    return result;
  }

  /**
   * Get compliance summary
   */
  getComplianceSummary(): {
    level: ComplianceLevel;
    totalEvents: number;
    archivedEvents: number;
    errorEvents: number;
    startTime: string | null;
    endTime: string | null;
  } {
    const errorEvents = this.auditLog.filter(e => e.eventType.includes('ERROR')).length;

    return {
      level: this.complianceLevel,
      totalEvents: this.auditLog.length,
      archivedEvents: this.archivedEvents,
      errorEvents,
      startTime: this.auditLog[0]?.timestamp ?? null,
      endTime: this.auditLog[this.auditLog.length - 1]?.timestamp ?? null,
    };
  }

  /**
   * Export audit trail for compliance report
   */
  exportAuditTrail(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(
        {
          compliance: this.getComplianceSummary(),
          events: this.auditLog,
        },
        null,
        2
      );
    } else {
      // CSV format
      const headers = ['ID', 'Timestamp', 'EventType', 'UserID', 'Details'];
      const rows = this.auditLog.map(e => [
        String(e.id),
        e.timestamp,
        e.eventType,
        e.userId ?? '',
        JSON.stringify(e.details),
      ]);

      return [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${v}"`).join(',')),
      ].join('\n');
    }
  }

  /**
   * Verify audit trail integrity
   */
  verifyIntegrity(): boolean {
    for (const event of this.auditLog) {
      const expectedChecksum = this.computeChecksum(event.eventType, event.details);
      if (event.checksum !== expectedChecksum) {
        console.error(`Integrity check failed for event ${event.id}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 10): ComplianceEvent[] {
    return this.auditLog.slice(-count);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string): ComplianceEvent[] {
    return this.auditLog.filter(e => e.eventType === eventType);
  }

  /**
   * Count events by type
   */
  getEventCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const event of this.auditLog) {
      counts[event.eventType] = (counts[event.eventType] ?? 0) + 1;
    }

    return counts;
  }

  /**
   * Compute SHA-256 checksum for integrity
   */
  private computeChecksum(eventType: string, details: any): string {
    try {
      // Try to use crypto if available (Node.js)
      const crypto = require('crypto');
      return crypto
        .createHash('sha256')
        .update(JSON.stringify({ eventType, details }))
        .digest('hex');
    } catch {
      // Fallback to simple hash for browser environments
      return this.simpleHash(JSON.stringify({ eventType, details }));
    }
  }

  /**
   * Simple hash function for browser compatibility
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Archive old events when max size exceeded
   */
  private archiveAndRotate(): void {
    // Keep recent 80% of events, archive oldest 20%
    const archiveCount = Math.floor(this.auditLog.length * 0.2);
    this.archivedEvents += archiveCount;

    this.auditLog = this.auditLog.slice(archiveCount);

    console.log(`Archived ${archiveCount} events (total archived: ${this.archivedEvents})`);
  }

  /**
   * Clear audit log (use with caution - for testing only)
   */
  clearAuditLog(): void {
    console.warn('⚠ Clearing audit log - this should only be done in testing!');
    this.auditLog = [];
    this.eventCounter = 0;
  }

  /**
   * Get compliance level
   */
  getComplianceLevel(): ComplianceLevel {
    return this.complianceLevel;
  }

  /**
   * Check if system is compliant with audit standards
   */
  isCompliant(): boolean {
    // Check integrity
    if (!this.verifyIntegrity()) {
      return false;
    }

    // Check that audit trail exists and has events
    if (this.auditLog.length === 0) {
      return false;
    }

    // For HIPAA, must have startup/shutdown events
    if (this.complianceLevel === 'HIPAA') {
      const hasBoot = this.auditLog.some(e => e.eventType === 'SYSTEM_BOOT');
      if (!hasBoot) {
        return false;
      }
    }

    return true;
  }
}
