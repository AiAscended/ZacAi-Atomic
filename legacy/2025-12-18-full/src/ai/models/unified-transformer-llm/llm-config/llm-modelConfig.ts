import { promises as fs, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { LLMModelConfig } from "../unified-transformer-llm_config/llm-modelConfig";
import { defaultLLMConfig } from "../unified-transformer-llm_config/llm-modelConfig";

const CONFIG_FILE_NAME = "unified-transformer-llm_config.json";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_DIR = path.resolve(__dirname, "..");
const DEFAULT_CONFIG_PATH = path.join(MODULE_DIR, CONFIG_FILE_NAME);

export interface LLMConfigLoadOptions {
  configPath?: string;
  overrides?: Partial<LLMModelConfig>;
  forceReload?: boolean;
}

let cachedConfig: LLMModelConfig | null = null;
let cachedPath: string | null = null;

export async function loadLLMConfig(options?: LLMConfigLoadOptions): Promise<LLMModelConfig> {
  const targetPath = options?.configPath || DEFAULT_CONFIG_PATH;
  if (!options?.forceReload && cachedConfig && cachedPath === targetPath) {
    return { ...cachedConfig };
  }

  const fileOverrides = await readConfigOverrides(targetPath);
  const merged = mergeLLMConfig(fileOverrides, options?.overrides);
  cachedConfig = merged;
  cachedPath = targetPath;
  return { ...merged };
}

export function loadLLMConfigSync(options?: LLMConfigLoadOptions): LLMModelConfig {
  const targetPath = options?.configPath || DEFAULT_CONFIG_PATH;
  if (!options?.forceReload && cachedConfig && cachedPath === targetPath) {
    return { ...cachedConfig };
  }

  const overridesFromDisk = readConfigOverridesSync(targetPath);
  const merged = mergeLLMConfig(overridesFromDisk, options?.overrides);
  cachedConfig = merged;
  cachedPath = targetPath;
  return { ...merged };
}

export function mergeLLMConfig(
  ...sources: Array<Partial<LLMModelConfig> | undefined>
): LLMModelConfig {
  const merged = sources.reduce<LLMModelConfig>((acc, source) => {
    if (!source) return acc;
    return { ...acc, ...source };
  }, { ...defaultLLMConfig });

  return validateLLMConfig(merged);
}

async function readConfigOverrides(filePath: string): Promise<Partial<LLMModelConfig>> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return extractOverrides(JSON.parse(raw));
  } catch (error) {
    handleReadError(error, filePath);
    return {};
  }
}

function readConfigOverridesSync(filePath: string): Partial<LLMModelConfig> {
  try {
    const raw = readFileSync(filePath, "utf-8");
    return extractOverrides(JSON.parse(raw));
  } catch (error) {
    handleReadError(error, filePath);
    return {};
  }
}

function extractOverrides(payload: unknown): Partial<LLMModelConfig> {
  if (!payload || typeof payload !== "object") return {};
  const overrides: Partial<LLMModelConfig> = {};
  const data = payload as Record<string, unknown>;

  const direct = data.llmConfigOverrides as Partial<LLMModelConfig> | undefined;
  if (direct) Object.assign(overrides, direct);

  const architecture = data.architecture as Record<string, unknown> | undefined;
  if (architecture) {
    if (typeof architecture.num_layers === "number") overrides.numLayers = architecture.num_layers;
    if (typeof architecture.num_heads === "number") overrides.numHeads = architecture.num_heads;
    if (typeof architecture.hidden_dim === "number") {
      overrides.hiddenDim = architecture.hidden_dim;
      overrides.hiddenSize = architecture.hidden_dim;
    }
    if (typeof architecture.input_dim === "number") overrides.embeddingDim = architecture.input_dim;
    if (typeof architecture.output_dim === "number") overrides.vocabSize = architecture.output_dim;
    if (typeof architecture.dropout === "number") {
      overrides.dropoutRate = architecture.dropout;
      overrides.attentionDropout = architecture.dropout;
    }
  }

  const hyper = data.hyperparameters as Record<string, unknown> | undefined;
  if (hyper) {
    if (typeof hyper.learning_rate === "number") overrides.learningRate = hyper.learning_rate;
    if (typeof hyper.batch_size === "number") overrides.batchSize = hyper.batch_size;
    if (typeof hyper.max_epochs === "number") overrides.maxSteps = hyper.max_epochs;
    if (typeof hyper.warmup_steps === "number") overrides.warmupSteps = hyper.warmup_steps;
  }

  return overrides;
}

function validateLLMConfig(config: LLMModelConfig): LLMModelConfig {
  if (config.numLayers <= 0) throw new Error("LLM config requires numLayers > 0");
  if (config.numHeads <= 0) throw new Error("LLM config requires numHeads > 0");
  if (config.embeddingDim <= 0) throw new Error("LLM config requires embeddingDim > 0");
  if (config.vocabSize <= 0) throw new Error("LLM config requires vocabSize > 0");
  return config;
}

function handleReadError(error: unknown, filePath: string): void {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
    console.warn(`[LLM Config] Failed to read ${filePath}:`, error);
  }
}

export type { LLMModelConfig };
export { defaultLLMConfig, CONFIG_FILE_NAME, DEFAULT_CONFIG_PATH };
export default loadLLMConfig;
