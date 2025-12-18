/**
 * File: src/ai/data/security/security_integrationAPI.ts
 * Purpose: Register security domain into central registry
 * Depends on: All security domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path";

import { domainRegistry } from "../domainRegistry";
import { SECURITY_DOMAIN } from "./security_constants";
import { loadSecuritySeedVocabulary } from "./security_vocabularyManager";
import { securityRunInference } from "./security_inferenceController";
import { securityRunTrainingEpoch } from "./security_trainingController";

const DOMAIN_NAME = "security";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const securityInit = async () => {
  await loadSecuritySeedVocabulary();

export interface SecuritySeedEntry {
  name: string
  description?: string
  category?: string
  impact?: string
  vulnerabilities?: string[]
  [key: string]: JsonValue | undefined
}

const SECURITY_MODULES: ModuleMetadata[] = [
  {
    name: "security_integration",
    atomicLevel: "organism",
    category: "integration_api",
    dependencies: [],
    capabilities: ["integration"],
    version: "1.0.0",
  },
  {
    name: "security_inference",
    atomicLevel: "organ",
    category: "inference",
    dependencies: [],
    capabilities: ["analysis", "reasoning"],
    version: "1.0.0",
  },
  {
    name: "security_training",
    atomicLevel: "cell",
    category: "training",
    dependencies: [],
    capabilities: ["learning"],
    version: "1.0.0",
  },
]

const isRecord = (value: unknown): value is Record<string, JsonValue> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

const sanitizeVulnerabilities = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined
  return value.filter((entry): entry is string => typeof entry === "string")
}

const normalizeEntry = (value: unknown, fallbackName: string): SecuritySeedEntry | null => {
  if (!isRecord(value)) return null

  const {
    name,
    description,
    category,
    impact,
    vulnerabilities,
    ...rest
  } = value

  const entryName = typeof name === "string" && name.trim().length > 0 ? name : fallbackName

  return {
    name: entryName,
    description: typeof description === "string" ? description : undefined,
    category: typeof category === "string" ? category : undefined,
    impact: typeof impact === "string" ? impact : undefined,
    vulnerabilities: sanitizeVulnerabilities(vulnerabilities),
    ...rest,
  }
}

const normalizePayload = (payload: unknown, sourceName: string): SecuritySeedEntry[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((entry, index) => normalizeEntry(entry, `${sourceName}:${index + 1}`))
      .filter((entry): entry is SecuritySeedEntry => Boolean(entry))
  }

  const entry = normalizeEntry(payload, sourceName)
  return entry ? [entry] : []
}

const parseSeedFile = async (filePath: string): Promise<SecuritySeedEntry[]> => {
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    const parsed = JSON.parse(raw) as unknown
    return normalizePayload(parsed, path.basename(filePath))
  } catch (error) {
    console.error(`[Security] Failed to parse seed file ${filePath}:`, error)
    return []
  }
}

export const loadSecuritySeedData = async (): Promise<SecuritySeedEntry[]> => {
  try {
    const files = await fs.readdir(DOMAIN_DIR)
    const jsonFiles = files.filter((file) => file.endsWith(".json"))

    const seedEntries: SecuritySeedEntry[] = []
    for (const file of jsonFiles) {
      const filePath = path.join(DOMAIN_DIR, file)
      const entries = await parseSeedFile(filePath)
      seedEntries.push(...entries)
    }

    console.log(`[Security] Loaded ${seedEntries.length} seed entries from ${jsonFiles.length} file(s).`)
    return seedEntries
  } catch (error) {
    console.error("[Security] Unable to read seed directory:", error)
    return []
  }
}

const registerSecurityDomain = () => {
  domainRegistry.registerDomain({
    name: SECURITY_DOMAIN,
    displayName: "Security",
    description:
      "Security analysis, vulnerability detection, and secure coding",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

void securityInit();
