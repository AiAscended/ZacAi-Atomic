import fs from "node:fs/promises"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { stableMirror } from "@/ai/memory"
import { MEMORY_PATHS } from "@/ai/memory/constants"

const fixtureDir = path.join(process.cwd(), "tmp", "stable-mirror-test")
const fixtureFile = path.join(fixtureDir, "sample.txt")
const restoreDir = path.join(fixtureDir, "restore")

let snapshotId: string | null = null

describe("StableMirrorManager", () => {
  beforeEach(async () => {
    await fs.mkdir(fixtureDir, { recursive: true })
    await fs.writeFile(fixtureFile, "stable mirror fixture", "utf8")
    await fs.rm(restoreDir, { recursive: true, force: true })
    snapshotId = null
  })

  afterEach(async () => {
    await fs.rm(fixtureDir, { recursive: true, force: true })
    if (snapshotId) {
      await fs.rm(path.join(MEMORY_PATHS.stable, snapshotId), { recursive: true, force: true })
    }
  })

  it("creates, verifies, and restores a snapshot", async () => {
    const manifest = await stableMirror.snapshot("kernel", [fixtureFile], { type: "test" })
    snapshotId = manifest.id

    expect(manifest.files).toHaveLength(1)
    expect(await stableMirror.verifySnapshot(manifest.id)).toBe(true)

    await stableMirror.restoreSnapshot(manifest.id, restoreDir)
    const restored = await fs.readFile(path.join(restoreDir, path.relative(process.cwd(), fixtureFile)), "utf8")
    expect(restored).toBe("stable mirror fixture")
  })
})
