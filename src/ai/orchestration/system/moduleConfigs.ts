import fs from "fs/promises";
import path from "path";
import type {
  ModuleCategory,
  ModuleCategoryConfig,
  ModuleScanContext,
} from "./types";

const REPO_ROOT = process.cwd();
const AI_ROOT = path.join(REPO_ROOT, "src", "ai");

export const SYSTEM_REGISTRY_FILE = path.join(
  AI_ROOT,
  "orchestration",
  "SYSTEM_REGISTRY.json"
);

export const DEFAULT_SKIP_FOLDERS = [
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
  "logs",
  "__pycache__",
  ".idea",
  ".vscode",
];

export const DEFAULT_SKIP_FILES = [
  "SYSTEM_REGISTRY.json",
  "MODEL_REGISTRY.json",
  "DOMAIN_REGISTRY.json",
  "UNIFIED_REGISTRY.json",
  "SYSTEM_SETTINGS.json",
];

const DOMAIN_METADATA = async (ctx: ModuleScanContext) => {
  const vocabFile = ctx.files.find(file => /seed.*vocab.*\.json$/i.test(file.relativePath));
  let seedVocabSize: number | undefined;
  if (vocabFile) {
    seedVocabSize = await countJsonEntries(vocabFile.absolutePath);
  }
  const learnedData = ctx.files.some(file => /learned.*data.*\.json$/i.test(file.relativePath));
  return {
    seedVocabSize,
    hasLearnedData: learnedData,
  };
};

const MODEL_METADATA = async (ctx: ModuleScanContext) => {
  const baseTokenFile = ctx.files.find(file => /base.*token.*\.json$/i.test(file.relativePath));
  let baseTokensCount: number | undefined;
  if (baseTokenFile) {
    baseTokensCount = await countJsonEntries(baseTokenFile.absolutePath);
  }
  return {
    modelType: detectModelSubtype(ctx.moduleId),
    baseTokensCount,
  };
};

const readCellMetadata = async (ctx: ModuleScanContext) => ({
  hasIndexModule: ctx.entries.index !== null,
});

export const moduleCategoryConfigs: ModuleCategoryConfig[] = [
  {
    category: "domain",
    label: "Knowledge Domain",
    description: "Domain models that expose integration APIs and inference controllers.",
    rootDir: path.join(AI_ROOT, "knowledge-domains"),
    entryFiles: {
      integrationAPI: /integration.*api\.ts$/i,
      inferenceController: /inference.*controller\.ts$/i,
      trainingController: /training.*controller\.ts$/i,
      tokenizer: /tokenizer\.ts$/i,
      baseTokens: /base.*token.*\.json$/i,
      seeds: /seed.*\.json$/i,
    },
    skipFolders: [...DEFAULT_SKIP_FOLDERS, "shared"],
    structureIndicators: {
      hasSeedsFolder: /seed/i,
      hasWeightsFolder: /weight/i,
      hasInferenceController: /inference.*controller\.ts$/i,
      hasTrainingController: /training.*controller\.ts$/i,
      hasIntegrationAPI: /integration.*api\.ts$/i,
      hasTokenizer: /tokenizer\.ts$/i,
    },
    requiredEntries: ["integrationAPI", "inferenceController"],
    loaderEntryKeys: ["integrationAPI", "inferenceController"],
    metadataExtractor: DOMAIN_METADATA,
    tags: ["ai", "domain"],
  },
  {
    category: "model",
    label: "AI Model",
    description: "Trainable or inference-only AI model modules.",
    rootDir: path.join(AI_ROOT, "models"),
    entryFiles: {
      inferenceEngine: /inference.*engine\.ts$/i,
      trainingPipeline: /training.*pipeline\.ts$/i,
      tokenizerConfig: /tokenizer.*config.*\.json$/i,
      baseTokens: /base.*token.*\.json$/i,
      scripts: /scripts\//i,
    },
    skipFolders: [...DEFAULT_SKIP_FOLDERS, "shared"],
    structureIndicators: {
      hasSeedsFolder: /seed|vocab/i,
      hasWeightsFolder: /weight/i,
      hasTokenizer: /tokenizer/i,
      hasTrainingCode: /training/i,
      hasInferenceEngine: /inference.*engine\.ts$/i,
    },
    requiredEntries: ["inferenceEngine"],
    loaderEntryKeys: ["inferenceEngine", "trainingPipeline"],
    metadataExtractor: MODEL_METADATA,
    tags: ["ai", "model"],
  },
  {
    category: "tool",
    label: "AI Tool",
    description: "Reusable AI tool modules (optional).",
    rootDir: path.join(AI_ROOT, "tools"),
    entryFiles: {
      index: /index\.(ts|js)$/i,
    },
    structureIndicators: {
      hasIndex: /index\.(ts|js)$/i,
    },
    requiredEntries: [],
    loaderEntryKeys: ["index"],
    tags: ["ai", "tool"],
  },
  {
    category: "agent",
    label: "AI Agent",
    rootDir: path.join(AI_ROOT, "agents"),
    entryFiles: {
      index: /index\.(ts|js)$/i,
    },
    structureIndicators: {
      hasPlanner: /planner/i,
      hasPolicy: /policy/i,
    },
    loaderEntryKeys: ["index"],
    tags: ["ai", "agent"],
  },
  {
    category: "utility",
    label: "AI Utility",
    rootDir: path.join(AI_ROOT, "ai_utils"),
    entryFiles: {
      index: /index\.(ts|js)$/i,
    },
    structureIndicators: {
      hasTests: /\.test\.(ts|js)$/i,
    },
    loaderEntryKeys: ["index"],
    tags: ["utility"],
  },
  {
    category: "pipeline",
    label: "Pipeline Component",
    rootDir: path.join(AI_ROOT, "data_pipeline"),
    entryFiles: {
      index: /index\.(ts|js)$/i,
    },
    structureIndicators: {
      hasStages: /stages?/i,
    },
    loaderEntryKeys: ["index"],
    tags: ["pipeline"],
  },
  {
    category: "hco",
    label: "Hybrid Cognition Orchestrator",
    description: "Central human-collaboration orchestrator components.",
    rootDir: path.join(AI_ROOT, "hco"),
    entryFiles: {
      index: /index\.(ts|js)$/i,
      orchestrator: /orchestrator\.ts$/i,
    },
    structureIndicators: {
      hasInstructions: /instructions?\.(ya?ml|md)$/i,
      hasState: /state/i,
    },
    loaderEntryKeys: ["index", "orchestrator"],
    tags: ["hco"],
  },
  {
    category: "cell",
    label: "AI Cell",
    description: "Top-level directories under src/ai treated as system cells.",
    rootDir: AI_ROOT,
    entryFiles: {
      index: /index\.(ts|js)$/i,
      router: /router\.ts$/i,
    },
    structureIndicators: {
      hasIndex: /index\.(ts|js)$/i,
      hasConfig: /config\.(ts|js|json)$/i,
      hasDocs: /README\.(md|mdx)$/i,
    },
    loaderEntryKeys: ["index", "router"],
    metadataExtractor: readCellMetadata,
    tags: ["cell"],
  },
];

export function getCategoryConfig(category: ModuleCategory): ModuleCategoryConfig | undefined {
  return moduleCategoryConfigs.find(config => config.category === category);
}

export function listModuleCategories(): ModuleCategoryConfig[] {
  return moduleCategoryConfigs.slice();
}

export function formatModuleName(folderName: string): string {
  return folderName
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function detectModelSubtype(folderName: string): string | undefined {
  const name = folderName.toLowerCase();
  if (/(llm|language|gpt|bert|t5)/.test(name)) return "llm";
  if (/(cnn|convolution)/.test(name)) return "cnn";
  if (/(rnn|recurrent|lstm|gru)/.test(name)) return "rnn";
  if (/(gan|adversarial)/.test(name)) return "gan";
  if (/(diffusion|stable)/.test(name)) return "diffusion";
  if (/(multimodal|vision)/.test(name)) return "multimodal";
  if (/(transformer)/.test(name)) return "transformer";
  return undefined;
}

async function countJsonEntries(filePath: string): Promise<number | undefined> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") return Object.keys(parsed).length;
    return undefined;
  } catch {
    return undefined;
  }
}
