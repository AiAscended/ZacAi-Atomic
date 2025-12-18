import { existsSync } from "fs";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { bootHeart, HEART_ORGANS, registerHeartCore, systemModel } from "../../core";

const HEART_STATE_DIR = path.join(process.cwd(), "src", "ai", "data", "heart-state");

describe("Heart Core bootstrap", () => {
  beforeEach(() => {
    systemModel.resetForTesting();
  });

  it("registers every heart organ descriptor", () => {
    registerHeartCore();

    HEART_ORGANS.forEach(organ => {
      const component = systemModel.getComponent(organ.id);
      expect(component, `component missing for ${organ.id}`).toBeTruthy();
      expect(component?.name).toBe(organ.name);
      expect(component?.kind).toBe(organ.kind);
    });
  });

  it("marks the primary organs as healthy on registration", () => {
    registerHeartCore();
    const heartCore = systemModel.getComponent("heart-core");
    const orchestrator = systemModel.getComponent("main-orchestrator");

    expect(heartCore?.status).toBe("healthy");
    expect(orchestrator?.status).toBe("healthy");
  });

  it("completes the boot process without blocking", async () => {
    registerHeartCore();
    const report = await bootHeart();

    expect(report.blocked).toBe(false);
    expect(existsSync(HEART_STATE_DIR)).toBe(true);
  });
});
