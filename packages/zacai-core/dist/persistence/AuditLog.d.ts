import type { AuditRecord } from "../types/index.js";
export declare class AuditLog {
    private ensureDir;
    write(record: AuditRecord): void;
    readLatest(limit?: number): AuditRecord[];
}
//# sourceMappingURL=AuditLog.d.ts.map