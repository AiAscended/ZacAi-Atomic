import { existsSync, appendFileSync, mkdirSync } from "fs";
import { join } from "path";
const DATA_DIR = join(process.cwd(), "packages", "zacai-core", "data");
const AUDIT_FILE = join(DATA_DIR, "audit.log");
export class AuditLog {
    ensureDir() {
        if (!existsSync(DATA_DIR)) {
            mkdirSync(DATA_DIR, { recursive: true });
        }
    }
    write(record) {
        this.ensureDir();
        const line = JSON.stringify(record);
        appendFileSync(AUDIT_FILE, line + "\n", "utf-8");
    }
    readLatest(limit = 20) {
        this.ensureDir();
        if (!existsSync(AUDIT_FILE))
            return [];
        const content = require("fs").readFileSync(AUDIT_FILE, "utf-8");
        const lines = content.trim().split("\n").filter(Boolean);
        const slice = lines.slice(-limit);
        return slice.map((line) => {
            try {
                return JSON.parse(line);
            }
            catch {
                return {
                    id: "parse-error",
                    timestamp: Date.now(),
                    event: "audit-parse-error",
                    detail: line,
                    severity: "warn",
                };
            }
        });
    }
}
//# sourceMappingURL=AuditLog.js.map