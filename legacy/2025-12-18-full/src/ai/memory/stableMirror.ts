import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { MEMORY_PATHS, getWorkspaceRelativePath } from "./constants"

export interface SnapshotFile {
  path: string
  checksum: string
}

export interface SnapshotManifest {
  id: string
  label: string
  createdAt: string
  createdBy: string
  files: SnapshotFile[]
  metadata?: Record<string, unknown>
}

export class StableMirrorManager {
  private readonly mirrorPath = MEMORY_PATHS.stable

  async ensureReady(): Promise<void> {
    await fs.mkdir(this.mirrorPath, { recursive: true })
  }

  async snapshot(label: string, files: string[], metadata?: Record<string, unknown>): Promise<SnapshotManifest> {
    await this.ensureReady()
    const id = `${label}-${Date.now()}`
    const targetDir = path.join(this.mirrorPath, id)
    await fs.mkdir(targetDir, { recursive: true })

    const manifestFiles = await Promise.all(
      files.map(async filePath => {
        const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
        const data = await fs.readFile(absolute)
        const checksum = this.calculateChecksum(data)
        const relativePath = getWorkspaceRelativePath(absolute)
        const destination = path.join(targetDir, relativePath)
        await fs.mkdir(path.dirname(destination), { recursive: true })
        await fs.writeFile(destination, data)
        return { path: relativePath, checksum }
      }),
    )

    const manifest: SnapshotManifest = {
      id,
      label,
      createdAt: new Date().toISOString(),
      createdBy: process.env.USER ?? "system",
      files: manifestFiles,
      metadata,
    }

    await fs.writeFile(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8")
    return manifest
  }

  async listSnapshots(): Promise<SnapshotManifest[]> {
    await this.ensureReady()
    const entries = await fs.readdir(this.mirrorPath).catch(() => [])
    const manifests: SnapshotManifest[] = []

    for (const entry of entries) {
      const manifestPath = path.join(this.mirrorPath, entry, "manifest.json")
      try {
        const raw = await fs.readFile(manifestPath, "utf8")
        manifests.push(JSON.parse(raw) as SnapshotManifest)
      } catch (error) {
        console.warn(`[stable-mirror] Unable to read manifest for ${entry}`, error)
      }
    }
    return manifests.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  }

  async verifySnapshot(id: string): Promise<boolean> {
    const snapshotDir = path.join(this.mirrorPath, id)
    const manifest = await this.readManifest(snapshotDir)
    if (!manifest) {
      return false
    }

    for (const file of manifest.files) {
      const absolute = path.join(snapshotDir, file.path)
      try {
        const data = await fs.readFile(absolute)
        const checksum = this.calculateChecksum(data)
        if (checksum !== file.checksum) {
          return false
        }
      } catch {
        return false
      }
    }
    return true
  }

  async restoreSnapshot(id: string, destinationRoot = process.cwd()): Promise<void> {
    const snapshotDir = path.join(this.mirrorPath, id)
    const manifest = await this.readManifest(snapshotDir)
    if (!manifest) {
      throw new Error(`Snapshot ${id} not found`)
    }

    for (const file of manifest.files) {
      const source = path.join(snapshotDir, file.path)
      const destination = path.join(destinationRoot, file.path)
      await fs.mkdir(path.dirname(destination), { recursive: true })
      await fs.copyFile(source, destination)
    }
  }

  private async readManifest(snapshotDir: string): Promise<SnapshotManifest | null> {
    try {
      const raw = await fs.readFile(path.join(snapshotDir, "manifest.json"), "utf8")
      return JSON.parse(raw) as SnapshotManifest
    } catch {
      return null
    }
  }

  private calculateChecksum(buffer: Buffer): string {
    return createHash("sha256").update(buffer).digest("hex")
  }
}

export const stableMirror = new StableMirrorManager()
