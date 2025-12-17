/**
 * Repair Domain Integration API
 * 
 * Handles error fixing, code repair, debugging strategies, and self-healing operations.
 * Provides automated and semi-automated repair capabilities.
 */

import fs from 'fs/promises';
import path from 'path';

import { domainRegistry, type ModuleMetadata } from '../domainRegistry';

const DOMAIN_NAME = 'repair';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);
const SEEDS_DIR = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`);

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface RepairSeedEntry {
  name: string;
  category?: string;
  issueType?: string;
  solution?: string;
  severity?: string;
  tags?: string[];
  [key: string]: JsonValue | undefined;
}

interface RepairQueryMetadata {
  totalConcepts: number;
  matchCount: number;
}

export interface RepairQueryResult {
  domain: string;
  confidence: number;
  matches: RepairSeedEntry[];
  suggestion: string;
  metadata: RepairQueryMetadata;
}

const REPAIR_KEYWORDS = [
  'fix', 'repair', 'debug', 'debugging', 'error', 'bug',
  'broken', 'issue', 'problem', 'solve', 'troubleshoot',
  'crash', 'failure', 'exception', 'self-heal', 'recover',
  'restore', 'correct', 'patch'
];

const REPAIR_MODULES: ModuleMetadata[] = [
  {
    name: 'repair_integration',
    atomicLevel: 'organism',
    category: 'integration_api',
    dependencies: [],
    capabilities: ['integration'],
    version: '1.0.0'
  },
  {
    name: 'repair_inference',
    atomicLevel: 'organ',
    category: 'inference',
    dependencies: [],
    capabilities: ['reasoning', 'debugging'],
    version: '1.0.0'
  },
  {
    name: 'repair_training',
    atomicLevel: 'cell',
    category: 'training',
    dependencies: [],
    capabilities: ['learning'],
    version: '1.0.0'
  }
];

const isRecord = (value: unknown): value is Record<string, JsonValue> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const sanitizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((entry): entry is string => typeof entry === 'string');
  return strings.length ? strings : undefined;
};

const normalizeEntry = (value: unknown, fallbackName: string): RepairSeedEntry | null => {
  if (!isRecord(value)) return null;

  const {
    name,
    category,
    issueType,
    solution,
    severity,
    tags,
    ...rest
  } = value;

  const derivedName = typeof name === 'string' && name.trim().length > 0 ? name : fallbackName;

  return {
    name: derivedName,
    category: typeof category === 'string' ? category : undefined,
    issueType: typeof issueType === 'string' ? issueType : undefined,
    solution: typeof solution === 'string' ? solution : undefined,
    severity: typeof severity === 'string' ? severity : undefined,
    tags: sanitizeStringArray(tags),
    ...rest
  };
};

const normalizePayload = (payload: unknown, sourceName: string): RepairSeedEntry[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((entry, index) => normalizeEntry(entry, `${sourceName}:${index + 1}`))
      .filter((entry): entry is RepairSeedEntry => Boolean(entry));
  }

  const entry = normalizeEntry(payload, sourceName);
  return entry ? [entry] : [];
};

const parseSeedFile = async (filePath: string): Promise<RepairSeedEntry[]> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    return normalizePayload(parsed, path.basename(filePath));
  } catch (error) {
    console.error(`[Repair] Failed to parse seed file ${filePath}:`, error);
    return [];
  }
};

export const loadSeedData = async (): Promise<RepairSeedEntry[]> => {
  try {
    const files = await fs.readdir(SEEDS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const allConcepts: unknown[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(SEEDS_DIR, file);
      const entries = await parseSeedFile(filePath);
      seedEntries.push(...entries);
    }

    console.log(`[Repair] Loaded ${seedEntries.length} seed entries from ${jsonFiles.length} file(s).`);
    return seedEntries;
  } catch (error) {
    console.error('[Repair] Error loading seed data:', error);
    return [];
  }
};

export const query = async (prompt: string): Promise<RepairQueryResult | null> => {
  const normalizedPrompt = prompt.toLowerCase();
  const hasRepairKeyword = REPAIR_KEYWORDS.some((keyword) => normalizedPrompt.includes(keyword));

  if (!hasRepairKeyword) {
    return null;
  }

  const seedData = await loadSeedData();
  if (!seedData.length) {
    return null;
  }

  const matches = seedData.filter((concept) => {
    const conceptText = JSON.stringify(concept).toLowerCase();
    return REPAIR_KEYWORDS.some((keyword) => conceptText.includes(keyword));
  });

  if (!matches.length) {
    return null;
  }

  return {
    domain: DOMAIN_NAME,
    confidence: 0.88,
    matches: matches.slice(0, 5),
    suggestion: 'Analyze error patterns, apply debugging strategies, and implement repair solutions',
    metadata: {
      totalConcepts: seedData.length,
      matchCount: matches.length,
    },
  };
};

const registerRepairDomain = (): void => {
  domainRegistry.registerDomain({
    name: DOMAIN_NAME,
    displayName: 'Repair & Debugging',
    description: 'Error fixing, code repair, debugging strategies, and self-healing operations',
    atomicLevel: 'molecule',
    modules: REPAIR_MODULES,
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

export const repairInit = async (): Promise<void> => {
  registerRepairDomain();

  try {
    console.log('[Repair] Initializing domain...');
    const seedData = await loadSeedData();

    if (!seedData.length) {
      console.warn('[Repair] No seed data loaded - domain may have limited capabilities');
    }

    console.log('[Repair] Domain initialized successfully');
  } catch (error) {
    console.error('[Repair] Initialization error:', error);
  }
};

void repairInit();

export default repairInit;
