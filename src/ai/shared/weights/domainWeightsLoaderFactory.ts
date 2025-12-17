import path from "path"
import { storageAdapter } from "../../knowledge-domains/storageAdapter"
import {
  WeightArtifactEntry,
  WeightArtifactType,
  WeightsManifestManager,
} from "./weightsManifestManager"

interface WeightFileConfigEntry {
  name?: string
  type?: string
  description?: string
  loadPriority?: number
  required?: boolean
}

export interface DomainWeightsLoaderOptions {
  domainName: string
  weightsRelativeDir?: string
  defaultWeightFile?: string
  weightConfigFile?: string
  baselineNotes?: string
  preferenceOrder?: WeightArtifactType[]
}

export interface DomainWeightsManager {
  storageBasePath: string
  loadWeights(): Promise<string | null>
  prime(): Promise<string | null>
  getActiveWeightArtifact(): Promise<WeightArtifactEntry | null>
  resolveActiveWeightFile(): Promise<string>
  listArtifacts(): Promise<WeightArtifactEntry[]>
}

function normalizeArtifactType(type?: string): WeightArtifactType {
  switch ((type ?? "").toLowerCase()) {
    case "trained":
      return "trained"
    case "bootstrapped":
      return "bootstrapped"
    case "checkpoint":
      return "checkpoint"
    default:
      return "pretrained"
  }
}

export function createDomainWeightsManager(options: DomainWeightsLoaderOptions): DomainWeightsManager {
  const domainName = options.domainName
  const weightsRelativeDir =
    options.weightsRelativeDir ?? `src/ai/knowledge-domains/${domainName}/${domainName}_weights`
  const storageBasePath = `/${weightsRelativeDir}`
  const defaultWeightFile = options.defaultWeightFile ?? `${domainName}_pretrained_weights.json`
  const weightConfigFile = options.weightConfigFile ?? `${domainName}_weights_config.json`
  const baselineNotes = options.baselineNotes ?? `Initial ${domainName} domain weights`

  const manifestManager = new WeightsManifestManager(path.join(process.cwd(), weightsRelativeDir), {
    preferenceOrder: options.preferenceOrder,
  })

  const logPrefix = `[${domainName}-weights]`

  const syncManifestFromConfig = async (): Promise<void> => {
    const configPath = `${storageBasePath}/${weightConfigFile}`
    if (!(await storageAdapter.exists(configPath))) {
      return
    }

    try {
      const raw = await storageAdapter.readFile(configPath)
      const parsed = JSON.parse(raw) as { weightFiles?: WeightFileConfigEntry[] }
      if (!Array.isArray(parsed.weightFiles) || parsed.weightFiles.length === 0) {
        return
      }

      const sorted = parsed.weightFiles
        .filter((entry): entry is WeightFileConfigEntry & { name: string } => Boolean(entry?.name))
        .sort(
          (a, b) =>
            (a.loadPriority ?? Number.MAX_SAFE_INTEGER) - (b.loadPriority ?? Number.MAX_SAFE_INTEGER)
        )

      if (!sorted.length) {
        return
      }

      const preferredPriority = sorted[0].loadPriority ?? Number.MAX_SAFE_INTEGER
      let hasActive = Boolean(await manifestManager.getActiveArtifact())

      for (const entry of sorted) {
        const candidatePath = `${storageBasePath}/${entry.name}`
        if (!(await storageAdapter.exists(candidatePath))) {
          continue
        }

        await manifestManager.registerArtifact(entry.name, {
          type: normalizeArtifactType(entry.type),
          notes: entry.description,
          source: `${domainName}-weights-config`,
          setActive: !hasActive && entry.loadPriority === preferredPriority,
        })

        if (!hasActive && entry.loadPriority === preferredPriority) {
          hasActive = true
        }
      }
    } catch (error) {
      console.warn(`${logPrefix} Unable to sync manifest from config`, error)
    }
  }

  const resolveActiveWeightFile = async (): Promise<string> => {
    await manifestManager.ensureInitialized()
    await manifestManager.ensureBaselineArtifact(defaultWeightFile, "pretrained", baselineNotes)
    await syncManifestFromConfig()

    const artifact = await manifestManager.getActiveArtifact()
    const candidate = artifact?.file ?? defaultWeightFile
    const candidatePath = `${storageBasePath}/${candidate}`

    if (await storageAdapter.exists(candidatePath)) {
      return candidate
    }

    const defaultPath = `${storageBasePath}/${defaultWeightFile}`
    if (candidate !== defaultWeightFile && (await storageAdapter.exists(defaultPath))) {
      return defaultWeightFile
    }

    console.warn(
      `${logPrefix} No on-disk weights matched manifest selection; falling back to manifest candidate ${candidate}`
    )
    return candidate
  }

  return {
    storageBasePath,
    resolveActiveWeightFile,
    prime: async () => {
      try {
        return await resolveActiveWeightFile()
      } catch (error) {
        console.error(`${logPrefix} Failed to prime manifest`, error)
        return null
      }
    },
    loadWeights: async () => {
      try {
        const filename = await resolveActiveWeightFile()
        const fullPath = `${storageBasePath}/${filename}`
        return await storageAdapter.readFile(fullPath)
      } catch (error) {
        console.warn(`${logPrefix} Failed to load weights`, { error })
        return null
      }
    },
    getActiveWeightArtifact: async () => {
      try {
        await manifestManager.ensureInitialized()
        return await manifestManager.getActiveArtifact()
      } catch (error) {
        console.error(`${logPrefix} Unable to read active artifact`, error)
        return null
      }
    },
    listArtifacts: async () => {
      await manifestManager.ensureInitialized()
      return manifestManager.listArtifacts()
    },
  }
}
