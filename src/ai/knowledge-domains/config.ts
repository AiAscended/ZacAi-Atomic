/**
 * File: src/ai/knowledge-domains/config.ts
 * Purpose: Domain scanner configuration using unified registry system
 */

import path from "path";
import type { ScannerConfig } from "../shared/registry/moduleRegistry";

export const domainScannerConfig: ScannerConfig = {
  scanDir: path.join(process.cwd(), "src", "ai", "knowledge-domains"),
  moduleType: "domain",
  registryFile: path.join(
    process.cwd(),
    "src",
    "ai",
    "knowledge-domains",
    "DOMAIN_REGISTRY.json",
  ),

  skipFolders: ["shared", "node_modules", ".git"],
  skipFiles: [
    "config.ts",
    "registry.ts",
    "domainScanner.ts",
    "registerAllDomains.ts",
    "DOMAIN_REGISTRY.json",
  ],

  requiredPatterns: {
    seedData: /seed.*data\.json/i,
    seedVocab: /seed.*vocab\.json/i,
    weights: /weight/i,
    pretrained: /pretrained/i,
    learnedData: /learned.*data\.json/i,
    trainingWeights: /training.*weight/i,
    tokenizer: /tokenizer\.ts/i,
    inferenceController: /inference.*controller\.ts/i,
    trainingController: /training.*controller\.ts/i,
    integrationAPI: /.*integration.*api\.ts/i,
  },
};
