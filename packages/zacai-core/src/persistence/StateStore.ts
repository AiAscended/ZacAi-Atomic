import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { KernelState } from "../types";

const DATA_DIR = join(process.cwd(), "packages", "zacai-core", "data");
const STATE_FILE = join(DATA_DIR, "kernel-state.json");

export class StateStore {
  private ensureDir() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  load(): KernelState {
    this.ensureDir();
    if (!existsSync(STATE_FILE)) {
      const initial: KernelState = {
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
    return JSON.parse(raw) as KernelState;
  }

  save(state: KernelState) {
    this.ensureDir();
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  }
}
