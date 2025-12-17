import { Dirent, promises as fs } from 'fs'
import path from 'path'
import {
  WeightsManifestManager,
  WeightArtifactType,
} from '../src/ai/shared/weights/weightsManifestManager'

interface WeightDir {
  label: string
  dirPath: string
}

function inferArtifactType(filename: string): WeightArtifactType {
  const lower = filename.toLowerCase()
  if (lower.includes('trained')) {
    return 'trained'
  }
  if (lower.includes('checkpoint') || lower.includes('training')) {
    return 'checkpoint'
  }
  if (lower.includes('bootstrap')) {
    return 'bootstrapped'
  }
  return 'pretrained'
}

async function safeReadDir(targetPath: string): Promise<Dirent[]> {
  try {
    return await fs.readdir(targetPath, { withFileTypes: true })
  } catch {
    return []
  }
}

async function discoverWeightDirs(baseDir: string, skip: Set<string> = new Set()): Promise<WeightDir[]> {
  const entries = await safeReadDir(baseDir)
  const results: WeightDir[] = []

  for (const entry of entries) {
    if (!entry.isDirectory() || skip.has(entry.name)) {
      continue
    }

    const ownerPath = path.join(baseDir, entry.name)
    const subEntries = await safeReadDir(ownerPath)

    for (const sub of subEntries) {
      if (sub.isDirectory() && sub.name.endsWith('_weights')) {
        results.push({ label: `${entry.name}/${sub.name}`, dirPath: path.join(ownerPath, sub.name) })
      }
    }
  }

  return results
}

function pickBaselineFile(files: string[]): string | null {
  const candidates = files.filter((file) => file !== 'weights-manifest.json')
  if (candidates.length === 0) {
    return null
  }

  const score = (file: string): number => {
    const lower = file.toLowerCase()
    if (lower.includes('trained')) return 5
    if (lower.includes('training')) return 4
    if (lower.includes('model_weights')) return 3
    if (file.endsWith('.json')) return 2
    if (file.endsWith('.bin')) return 1
    return 0
  }

  return candidates.sort((a, b) => score(b) - score(a))[0]
}

async function ensureManifestForDir(label: string, dirPath: string): Promise<void> {
  const entries = await safeReadDir(dirPath)
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
  const baseline = pickBaselineFile(files)

  if (!baseline) {
    console.log(`[manifest] Skipping ${label}: no candidate weight files found`)
    return
  }

  const manager = new WeightsManifestManager(dirPath)
  await manager.ensureInitialized()
  await manager.ensureBaselineArtifact(
    baseline,
    inferArtifactType(baseline),
    'Migrated baseline artifact'
  )
  console.log(`[manifest] Ensured baseline for ${label}: ${baseline}`)
}

async function main(): Promise<void> {
  const filter = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || null

  const knowledgeDomains = await discoverWeightDirs(
    path.join(process.cwd(), 'src/ai/knowledge-domains'),
    new Set(['utils'])
  )
  const models = await discoverWeightDirs(
    path.join(process.cwd(), 'src/ai/models'),
    new Set(['shared'])
  )

  const allTargets = [...knowledgeDomains, ...models]

  for (const target of allTargets) {
    if (filter && !target.label.includes(filter)) {
      continue
    }

    await ensureManifestForDir(target.label, target.dirPath)
  }

  console.log('[manifest] Migration complete')
}

main().catch((error) => {
  console.error('[manifest] Migration failed', error)
  process.exit(1)
})
