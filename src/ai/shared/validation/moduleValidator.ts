/**
 * File: src/ai/shared/validation/moduleValidator.ts
 * Purpose: Validate model and domain structures before registration
 * 
 * Features:
 * - Health checks for models and domains
 * - Structure integrity validation
 * - Prevent crashes from malformed plugins
 * - Detailed error reporting
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { ModelManifest } from "../../models/modelRegistry";
import type { DomainManifest } from "../../knowledge-domains/domainScanner";

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    name: string;
    passed: boolean;
    message?: string;
  }[];
  timestamp: string;
}

// ============================================================================
// Model Validator
// ============================================================================

export class ModelValidator {
  /**
   * Validate model structure
   */
  static async validateModel(
    modelId: string,
    modelPath: string,
    manifest: ModelManifest
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    // Required structure checks
    if (!manifest.structure.hasSeedsFolder) {
      errors.push("Missing seeds/ folder");
      score -= 20;
    }
    
    if (!manifest.structure.hasWeightsFolder) {
      errors.push("Missing weights/ folder");
      score -= 20;
    }
    
    if (!manifest.structure.hasTokenizerConfig) {
      errors.push("Missing tokenizer configuration");
      score -= 15;
    }
    
    if (!manifest.structure.hasInferenceEngine) {
      warnings.push("Missing inference engine");
      score -= 10;
    }
    
    if (!manifest.structure.hasTrainingPipeline) {
      warnings.push("Missing training pipeline");
      score -= 5;
    }
    
    // Check base tokens
    if (manifest.paths.baseTokensPath) {
      try {
        const baseTokensPath = path.join(modelPath, manifest.paths.baseTokensPath);
        const content = await fs.readFile(baseTokensPath, "utf8");
        const tokens = JSON.parse(content);
        
        if (!Array.isArray(tokens) && typeof tokens !== "object") {
          errors.push("Invalid base tokens format");
          score -= 10;
        } else {
          const tokenCount = Array.isArray(tokens) 
            ? tokens.length 
            : Object.keys(tokens).length;
          
          if (tokenCount < 20 || tokenCount > 40) {
            warnings.push(`Base token count (${tokenCount}) outside optimal range (20-40)`);
            score -= 5;
          }
        }
      } catch (error) {
        warnings.push("Could not validate base tokens file");
        score -= 5;
      }
    } else {
      warnings.push("No base tokens file found");
      score -= 5;
    }
    
    // Check pretrained weights
    if (manifest.paths.pretrainedWeightsPath) {
      try {
        const weightsPath = path.join(modelPath, manifest.paths.pretrainedWeightsPath);
        const stats = await fs.stat(weightsPath);
        
        if (stats.size === 0) {
          warnings.push("Pretrained weights file is empty");
          score -= 5;
        }
      } catch {
        warnings.push("Could not access pretrained weights");
        score -= 5;
      }
    }
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }
  
  /**
   * Health check for model
   */
  static async healthCheck(
    modelId: string,
    modelPath: string,
    manifest: ModelManifest
  ): Promise<HealthCheckResult> {
    const checks: HealthCheckResult["checks"] = [];
    
    // Check seeds folder
    try {
      const seedsPath = path.join(modelPath, "seeds");
      await fs.access(seedsPath);
      checks.push({ name: "Seeds folder", passed: true });
    } catch {
      checks.push({ name: "Seeds folder", passed: false, message: "Not accessible" });
    }
    
    // Check weights folder
    try {
      const weightsPath = path.join(modelPath, "weights");
      await fs.access(weightsPath);
      checks.push({ name: "Weights folder", passed: true });
    } catch {
      checks.push({ name: "Weights folder", passed: false, message: "Not accessible" });
    }
    
    // Check inference engine
    if (manifest.paths.inferenceEnginePath) {
      try {
        const enginePath = path.join(modelPath, manifest.paths.inferenceEnginePath);
        await fs.access(enginePath);
        checks.push({ name: "Inference engine", passed: true });
      } catch {
        checks.push({ name: "Inference engine", passed: false, message: "Not accessible" });
      }
    } else {
      checks.push({ name: "Inference engine", passed: false, message: "Not configured" });
    }
    
    // Calculate status
    const passedCount = checks.filter(c => c.passed).length;
    const totalCount = checks.length;
    const passRate = passedCount / totalCount;
    
    let status: HealthCheckResult["status"];
    if (passRate >= 0.8) status = "healthy";
    else if (passRate >= 0.5) status = "degraded";
    else status = "unhealthy";
    
    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Domain Validator
// ============================================================================

export class DomainValidator {
  /**
   * Validate domain structure
   */
  static async validateDomain(
    domainId: string,
    domainPath: string,
    manifest: DomainManifest
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    // Required structure checks
    if (!manifest.structure.hasInferenceController) {
      errors.push("Missing inference controller");
      score -= 25;
    }
    
    if (!manifest.structure.hasIntegrationAPI) {
      errors.push("Missing integration API");
      score -= 25;
    }
    
    if (!manifest.structure.hasSeedsFolder) {
      warnings.push("Missing seeds folder");
      score -= 10;
    }
    
    if (!manifest.structure.hasWeightsFolder) {
      warnings.push("Missing weights folder");
      score -= 10;
    }
    
    if (!manifest.structure.hasTrainingController) {
      warnings.push("Missing training controller");
      score -= 5;
    }
    
    if (!manifest.structure.hasTokenizer) {
      warnings.push("Missing tokenizer");
      score -= 5;
    }
    
    // Check seed vocab
    if (manifest.paths.seedVocabPath) {
      try {
        const vocabPath = path.join(domainPath, manifest.paths.seedVocabPath);
        const content = await fs.readFile(vocabPath, "utf8");
        const vocab = JSON.parse(content);
        
        const vocabSize = Array.isArray(vocab) 
          ? vocab.length 
          : Object.keys(vocab).length;
        
        if (vocabSize === 0) {
          warnings.push("Seed vocabulary is empty");
          score -= 10;
        } else if (vocabSize < 10) {
          warnings.push(`Seed vocabulary is very small (${vocabSize} terms)`);
          score -= 5;
        }
      } catch {
        warnings.push("Could not validate seed vocabulary");
        score -= 5;
      }
    } else {
      warnings.push("No seed vocabulary found");
      score -= 5;
    }
    
    // Check integration API
    if (manifest.paths.integrationAPIPath) {
      try {
        const apiPath = path.join(domainPath, manifest.paths.integrationAPIPath);
        const content = await fs.readFile(apiPath, "utf8");
        
        // Check for required exports
        const hasInitialize = content.includes("initialize");
        const hasQuery = content.includes("query");
        
        if (!hasInitialize) {
          warnings.push("Integration API missing initialize function");
          score -= 5;
        }
        
        if (!hasQuery) {
          warnings.push("Integration API missing query function");
          score -= 5;
        }
      } catch {
        warnings.push("Could not validate integration API");
        score -= 5;
      }
    }
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }
  
  /**
   * Health check for domain
   */
  static async healthCheck(
    domainId: string,
    domainPath: string,
    manifest: DomainManifest
  ): Promise<HealthCheckResult> {
    const checks: HealthCheckResult["checks"] = [];
    
    // Check inference controller
    if (manifest.paths.inferenceControllerPath) {
      try {
        const controllerPath = path.join(domainPath, manifest.paths.inferenceControllerPath);
        await fs.access(controllerPath);
        checks.push({ name: "Inference controller", passed: true });
      } catch {
        checks.push({ name: "Inference controller", passed: false, message: "Not accessible" });
      }
    } else {
      checks.push({ name: "Inference controller", passed: false, message: "Not configured" });
    }
    
    // Check integration API
    if (manifest.paths.integrationAPIPath) {
      try {
        const apiPath = path.join(domainPath, manifest.paths.integrationAPIPath);
        await fs.access(apiPath);
        checks.push({ name: "Integration API", passed: true });
      } catch {
        checks.push({ name: "Integration API", passed: false, message: "Not accessible" });
      }
    } else {
      checks.push({ name: "Integration API", passed: false, message: "Not configured" });
    }
    
    // Check seed vocab
    if (manifest.paths.seedVocabPath) {
      try {
        const vocabPath = path.join(domainPath, manifest.paths.seedVocabPath);
        const stats = await fs.stat(vocabPath);
        checks.push({ 
          name: "Seed vocabulary", 
          passed: stats.size > 0,
          message: stats.size === 0 ? "File is empty" : undefined
        });
      } catch {
        checks.push({ name: "Seed vocabulary", passed: false, message: "Not accessible" });
      }
    } else {
      checks.push({ name: "Seed vocabulary", passed: false, message: "Not found" });
    }
    
    // Calculate status
    const passedCount = checks.filter(c => c.passed).length;
    const totalCount = checks.length;
    const passRate = passedCount / totalCount;
    
    let status: HealthCheckResult["status"];
    if (passRate >= 0.8) status = "healthy";
    else if (passRate >= 0.5) status = "degraded";
    else status = "unhealthy";
    
    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate file exists and is accessible
 */
export async function validateFileAccess(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate JSON file format
 */
export async function validateJSONFile(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}
