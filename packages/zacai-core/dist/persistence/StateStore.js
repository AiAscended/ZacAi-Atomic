import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
const DATA_DIR = join(process.cwd(), "packages", "zacai-core", "data");
const STATE_FILE = join(DATA_DIR, "kernel-state.json");
export class StateStore {
    ensureDir() {
        if (!existsSync(DATA_DIR)) {
            mkdirSync(DATA_DIR, { recursive: true });
        }
    }
    load() {
        this.ensureDir();
        if (!existsSync(STATE_FILE)) {
            const initial = {
                lastBoot: Date.now(),
                lastHealthAt: undefined,
                lastRecoveryPlanAt: undefined,
                stableBranch: "main",
                backupPath: "memory/backup",
                activeProfile: "stable",
                notes: "fresh-state",
            };
            this.save(initial);
            return initial;
        }
        const raw = readFileSync(STATE_FILE, "utf-8");
        return JSON.parse(raw);
    }
    save(state) {
        this.ensureDir();
        writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    }
}
//# sourceMappingURL=StateStore.js.map