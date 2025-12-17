import fs from "node:fs/promises"
import path from "node:path"
import { MEMORY_PATHS } from "./constants"
import type { SnapshotManifest } from "./stableMirror"

export class BackupMirrorManager {
  private readonly mirrorPath = MEMORY_PATHS.backup

  async ensureReady(): Promise<void> {
    await fs.mkdir(this.mirrorPath, { recursive: true })
  }

  async listManifests(): Promise<SnapshotManifest[]> {
    await this.ensureReady()
    const entries = await fs.readdir(this.mirrorPath).catch(() => [])
    const manifests: SnapshotManifest[] = []

    for (const entry of entries) {
      const manifestPath = path.join(this.mirrorPath, entry, "manifest.json")
      try {
        const raw = await fs.readFile(manifestPath, "utf8")
        manifests.push(JSON.parse(raw) as SnapshotManifest)
      } catch (error) {
        console.warn(`[backup-mirror] Unable to read manifest for ${entry}`, error)
      }
    }
    return manifests
  }

  async getSnapshotDirectory(id: string): Promise<string> {
    const snapshotDir = path.join(this.mirrorPath, id)
    await fs.access(snapshotDir)
    return snapshotDir
  }

  /**
   * Copies a snapshot from the stable mirror into the locked backup location.
   * Caller is expected to run after admin approval.
   */
  async ingestFromStable(snapshotDir: string): Promise<void> {
    const entryName = path.basename(snapshotDir)
    const destination = path.join(this.mirrorPath, entryName)

    await fs.mkdir(destination, { recursive: true })
    await this.copyDirectory(snapshotDir, destination)
  }

  private async copyDirectory(source: string, destination: string) {
    const entries = await fs.readdir(source, { withFileTypes: true })
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name)
      const destPath = path.join(destination, entry.name)
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true })
        await this.copyDirectory(sourcePath, destPath)
      } else if (entry.isFile()) {
        await fs.copyFile(sourcePath, destPath)
      }
    }
  }
}

export const backupMirror = new BackupMirrorManager()
