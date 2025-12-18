import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export type WeightArtifactType = 'bootstrapped' | 'pretrained' | 'trained' | 'checkpoint'

export interface WeightArtifactEntry {
  id: string
  type: WeightArtifactType
  file: string
  createdAt: string
  source?: string
  trainingRunId?: string
  metrics?: Record<string, number>
  notes?: string
}

export interface WeightManifest {
  activeArtifactId?: string
  artifacts: WeightArtifactEntry[]
}

export interface SaveWeightsOptions {
  type?: WeightArtifactType
  source?: string
  trainingRunId?: string
  metrics?: Record<string, number>
  notes?: string
  setActive?: boolean
}

export interface WeightsManifestManagerOptions {
  manifestName?: string
  preferenceOrder?: WeightArtifactType[]
}

export class WeightsManifestManager {
  private manifestPath: string
  private preferenceOrder: WeightArtifactType[]

  constructor(private weightsDir: string, options?: WeightsManifestManagerOptions) {
    this.manifestPath = path.join(weightsDir, options?.manifestName ?? 'weights-manifest.json')
    this.preferenceOrder = options?.preferenceOrder ?? ['trained', 'pretrained', 'bootstrapped', 'checkpoint']
  }

  public resolvePath(filename: string): string {
    return path.isAbsolute(filename) ? filename : path.join(this.weightsDir, filename)
  }

  public async ensureInitialized(): Promise<void> {
    await fs.mkdir(this.weightsDir, { recursive: true })
    const exists = await this.fileExists(this.manifestPath)
    if (!exists) {
      const manifest: WeightManifest = { artifacts: [] }
      await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2))
    }
  }

  private async fileExists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath)
      return true
    } catch {
      return false
    }
  }

  private async readManifest(): Promise<WeightManifest> {
    await this.ensureInitialized()
    const data = await fs.readFile(this.manifestPath, 'utf-8')
    return JSON.parse(data) as WeightManifest
  }

  private async writeManifest(manifest: WeightManifest): Promise<void> {
    await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2))
  }

  public async registerArtifact(
    file: string,
    options: SaveWeightsOptions & { type: WeightArtifactType }
  ): Promise<WeightArtifactEntry> {
    await this.ensureInitialized()
    const manifest = await this.readManifest()
    const now = new Date().toISOString()
    const existing = manifest.artifacts.find((artifact) => artifact.file === file)

    if (existing) {
      existing.type = options.type
      existing.source = options.source ?? existing.source
      existing.trainingRunId = options.trainingRunId ?? existing.trainingRunId
      existing.metrics = options.metrics ?? existing.metrics
      existing.notes = options.notes ?? existing.notes
      existing.createdAt = existing.createdAt || now
      if (options.setActive) {
        manifest.activeArtifactId = existing.id
      }
      await this.writeManifest(manifest)
      return existing
    }

    const artifact: WeightArtifactEntry = {
      id: randomUUID(),
      type: options.type,
      file,
      createdAt: now,
      source: options.source,
      trainingRunId: options.trainingRunId,
      metrics: options.metrics,
      notes: options.notes,
    }

    manifest.artifacts.push(artifact)
    if (options.setActive || !manifest.activeArtifactId) {
      manifest.activeArtifactId = artifact.id
    }
    await this.writeManifest(manifest)
    return artifact
  }

  public async ensureBaselineArtifact(
    file: string,
    type: WeightArtifactType = 'bootstrapped',
    notes = 'Auto-registered baseline weights'
  ): Promise<void> {
    const resolved = this.resolvePath(file)
    if (!(await this.fileExists(resolved))) {
      return
    }

    const manifest = await this.readManifest()
    const alreadyTracked = manifest.artifacts.some((artifact) => artifact.file === file)
    if (!alreadyTracked) {
      await this.registerArtifact(file, {
        type,
        notes,
        source: 'baseline-detection',
        setActive: !manifest.activeArtifactId,
      })
    }
  }

  public async getActiveArtifact(preferenceOrder?: WeightArtifactType[]): Promise<WeightArtifactEntry | null> {
    await this.ensureInitialized()
    const manifest = await this.readManifest()
    if (manifest.artifacts.length === 0) {
      return null
    }

    const validArtifacts: WeightArtifactEntry[] = []
    for (const artifact of manifest.artifacts) {
      const artifactPath = this.resolvePath(artifact.file)
      if (await this.fileExists(artifactPath)) {
        validArtifacts.push(artifact)
      }
    }

    if (validArtifacts.length === 0) {
      return null
    }

    const active = manifest.activeArtifactId
      ? validArtifacts.find((entry) => entry.id === manifest.activeArtifactId)
      : null
    if (active) {
      return active
    }

    const order = preferenceOrder || this.preferenceOrder
    for (const type of order) {
      const matches = validArtifacts
        .filter((entry) => entry.type === type)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      if (matches.length > 0) {
        return matches[0]
      }
    }

    return validArtifacts[0]
  }

  public async setActiveArtifact(artifactId: string): Promise<void> {
    const manifest = await this.readManifest()
    manifest.activeArtifactId = artifactId
    await this.writeManifest(manifest)
  }

  public async listArtifacts(): Promise<WeightArtifactEntry[]> {
    const manifest = await this.readManifest()
    return manifest.artifacts
  }
}
