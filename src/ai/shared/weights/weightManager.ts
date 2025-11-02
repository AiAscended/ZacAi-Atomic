/**
 * Weight Manager System
 * 
 * Centralized weight loading and management for all domains and models.
 * Handles pretrained and trained weights with date-stamped versions.
 * Integrates with mainOrchestrator and inference engine.
 */

import fs from 'fs';
import path from 'path';

export interface WeightMetadata {
  version: string;
  type: 'pretrained' | 'trained';
  domain?: string;
  model?: string;
  created: string;
  date_stamp?: string;
  training_run?: number;
  description: string;
  architecture: Record<string, any>;
  weights: Record<string, any>;
  capabilities: string[];
  performance: {
    accuracy: number;
    f1_score: number;
    [key: string]: any;
  };
  metadata: Record<string, any>;
}

export interface WeightEntry {
  component: string; // domain or model name
  type: 'domain' | 'model';
  pretrainedPath: string;
  trainedPaths: string[]; // Array of trained weight files (date-stamped)
  currentWeights: 'pretrained' | string; // 'pretrained' or path to trained weights
  pretrainedMetadata?: WeightMetadata;
  trainedMetadata?: WeightMetadata[];
  loaded: boolean;
  lastLoaded?: Date;
}

class WeightManagerSystem {
  private static instance: WeightManagerSystem;
  private weightRegistry: Map<string, WeightEntry> = new Map();
  private domainsPath: string;
  private modelsPath: string;
  private initialized: boolean = false;

  private constructor() {
    this.domainsPath = path.join(process.cwd(), 'src/ai/knowledge-domains');
    this.modelsPath = path.join(process.cwd(), 'src/ai/models');
  }

  public static getInstance(): WeightManagerSystem {
    if (!WeightManagerSystem.instance) {
      WeightManagerSystem.instance = new WeightManagerSystem();
    }
    return WeightManagerSystem.instance;
  }

  /**
   * Initialize the weight manager - scan all domains and models
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Weight Manager already initialized');
      return;
    }

    console.log('🔧 Initializing Weight Manager System...');
    const startTime = Date.now();

    try {
      // Scan domains
      await this.scanDomains();
      
      // Scan models
      await this.scanModels();

      this.initialized = true;
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ Weight Manager initialized successfully`);
      console.log(`   - Total components: ${this.weightRegistry.size}`);
      console.log(`   - Load time: ${loadTime}ms`);
    } catch (error) {
      console.error('❌ Error initializing Weight Manager:', error);
      throw error;
    }
  }

  /**
   * Scan all knowledge domains for weights
   */
  private async scanDomains(): Promise<void> {
    if (!fs.existsSync(this.domainsPath)) {
      console.warn('⚠️  Domains path not found:', this.domainsPath);
      return;
    }

    const domains = fs.readdirSync(this.domainsPath);

    for (const domain of domains) {
      const domainPath = path.join(this.domainsPath, domain);
      const stat = fs.statSync(domainPath);

      if (!stat.isDirectory()) continue;

      const weightsPath = path.join(domainPath, `${domain}_weights`);
      
      if (!fs.existsSync(weightsPath)) {
        console.warn(`⚠️  No weights folder for domain: ${domain}`);
        continue;
      }

      const entry = await this.scanWeightsFolder(domain, weightsPath, 'domain');
      if (entry) {
        this.weightRegistry.set(`domain:${domain}`, entry);
      }
    }

    console.log(`   📁 Scanned ${this.weightRegistry.size} domains`);
  }

  /**
   * Scan all AI models for weights
   */
  private async scanModels(): Promise<void> {
    if (!fs.existsSync(this.modelsPath)) {
      console.warn('⚠️  Models path not found:', this.modelsPath);
      return;
    }

    const models = fs.readdirSync(this.modelsPath);
    let modelCount = 0;

    for (const model of models) {
      if (model === 'shared') continue;

      const modelPath = path.join(this.modelsPath, model);
      const stat = fs.statSync(modelPath);

      if (!stat.isDirectory()) continue;

      const weightsPath = path.join(modelPath, `${model}_weights`);
      
      if (!fs.existsSync(weightsPath)) {
        console.warn(`⚠️  No weights folder for model: ${model}`);
        continue;
      }

      const entry = await this.scanWeightsFolder(model, weightsPath, 'model');
      if (entry) {
        this.weightRegistry.set(`model:${model}`, entry);
        modelCount++;
      }
    }

    console.log(`   🤖 Scanned ${modelCount} models`);
  }

  /**
   * Scan a weights folder and create an entry
   */
  private async scanWeightsFolder(
    component: string,
    weightsPath: string,
    type: 'domain' | 'model'
  ): Promise<WeightEntry | null> {
    try {
      const files = fs.readdirSync(weightsPath);
      
      // Find pretrained weights
      const pretrainedFile = files.find(f => 
        f.includes('pretrained_weights') && f.endsWith('.json')
      );

      if (!pretrainedFile) {
        console.warn(`⚠️  No pretrained weights found for ${component}`);
        return null;
      }

      const pretrainedPath = path.join(weightsPath, pretrainedFile);

      // Find all trained weights (date-stamped)
      const trainedFiles = files
        .filter(f => f.includes('trained_weights') && f.endsWith('.json'))
        .map(f => path.join(weightsPath, f))
        .sort(); // Sort by filename (date stamps)

      // Load pretrained metadata
      let pretrainedMetadata: WeightMetadata | undefined;
      try {
        const content = fs.readFileSync(pretrainedPath, 'utf-8');
        pretrainedMetadata = JSON.parse(content);
      } catch (error) {
        console.warn(`⚠️  Could not parse pretrained weights for ${component}`);
      }

      // Load trained metadata
      const trainedMetadata: WeightMetadata[] = [];
      for (const trainedPath of trainedFiles) {
        try {
          const content = fs.readFileSync(trainedPath, 'utf-8');
          trainedMetadata.push(JSON.parse(content));
        } catch (error) {
          console.warn(`⚠️  Could not parse trained weights: ${trainedPath}`);
        }
      }

      // Determine current weights (use latest trained if available, else pretrained)
      const currentWeights = trainedFiles.length > 0 
        ? trainedFiles[trainedFiles.length - 1] 
        : 'pretrained';

      return {
        component,
        type,
        pretrainedPath,
        trainedPaths: trainedFiles,
        currentWeights,
        pretrainedMetadata,
        trainedMetadata,
        loaded: false
      };
    } catch (error) {
      console.error(`❌ Error scanning weights for ${component}:`, error);
      return null;
    }
  }

  /**
   * Get weight entry for a component
   */
  public getWeightEntry(component: string, type: 'domain' | 'model'): WeightEntry | undefined {
    return this.weightRegistry.get(`${type}:${component}`);
  }

  /**
   * Get all weight entries
   */
  public getAllWeightEntries(): Map<string, WeightEntry> {
    return new Map(this.weightRegistry);
  }

  /**
   * Load weights for a specific component
   */
  public async loadWeights(component: string, type: 'domain' | 'model'): Promise<WeightMetadata | null> {
    const entry = this.getWeightEntry(component, type);
    
    if (!entry) {
      console.warn(`⚠️  No weight entry found for ${type}:${component}`);
      return null;
    }

    try {
      let weightsPath: string;
      let metadata: WeightMetadata | undefined;

      if (entry.currentWeights === 'pretrained') {
        weightsPath = entry.pretrainedPath;
        metadata = entry.pretrainedMetadata;
      } else {
        weightsPath = entry.currentWeights;
        metadata = entry.trainedMetadata?.find(m => 
          entry.currentWeights.includes(m.date_stamp || '')
        );
      }

      if (!metadata) {
        const content = fs.readFileSync(weightsPath, 'utf-8');
        metadata = JSON.parse(content);
      }

      entry.loaded = true;
      entry.lastLoaded = new Date();

      return metadata;
    } catch (error) {
      console.error(`❌ Error loading weights for ${type}:${component}:`, error);
      return null;
    }
  }

  /**
   * Switch to specific trained weights version
   */
  public async switchToTrainedWeights(
    component: string,
    type: 'domain' | 'model',
    dateStamp: string
  ): Promise<boolean> {
    const entry = this.getWeightEntry(component, type);
    
    if (!entry) {
      console.warn(`⚠️  No weight entry found for ${type}:${component}`);
      return false;
    }

    const targetPath = entry.trainedPaths.find(p => p.includes(dateStamp));
    
    if (!targetPath) {
      console.warn(`⚠️  No trained weights found with date stamp: ${dateStamp}`);
      return false;
    }

    entry.currentWeights = targetPath;
    console.log(`✅ Switched ${type}:${component} to trained weights (${dateStamp})`);
    return true;
  }

  /**
   * Get statistics about the weight system
   */
  public getStats() {
    const stats = {
      totalComponents: this.weightRegistry.size,
      domains: 0,
      models: 0,
      componentsWithTrainedWeights: 0,
      totalTrainedVersions: 0,
      loadedComponents: 0,
      usingPretrainedOnly: 0,
      usingTrainedWeights: 0
    };

    for (const [key, entry] of this.weightRegistry) {
      if (entry.type === 'domain') stats.domains++;
      if (entry.type === 'model') stats.models++;
      if (entry.trainedPaths.length > 0) stats.componentsWithTrainedWeights++;
      stats.totalTrainedVersions += entry.trainedPaths.length;
      if (entry.loaded) stats.loadedComponents++;
      if (entry.currentWeights === 'pretrained') stats.usingPretrainedOnly++;
      else stats.usingTrainedWeights++;
    }

    return stats;
  }

  /**
   * Get latest trained weights date for a component
   */
  public getLatestTrainingDate(component: string, type: 'domain' | 'model'): string | null {
    const entry = this.getWeightEntry(component, type);
    
    if (!entry || entry.trainedMetadata.length === 0) {
      return null;
    }

    // Return the date stamp from the latest trained weights
    const latest = entry.trainedMetadata[entry.trainedMetadata.length - 1];
    return latest.date_stamp || latest.created;
  }

  /**
   * List all available weight versions for a component
   */
  public listWeightVersions(component: string, type: 'domain' | 'model'): Array<{
    type: 'pretrained' | 'trained';
    date: string;
    version: string;
    path: string;
    isCurrent: boolean;
  }> {
    const entry = this.getWeightEntry(component, type);
    
    if (!entry) {
      return [];
    }

    const versions = [];

    // Add pretrained
    if (entry.pretrainedMetadata) {
      versions.push({
        type: 'pretrained' as const,
        date: entry.pretrainedMetadata.created,
        version: entry.pretrainedMetadata.version,
        path: entry.pretrainedPath,
        isCurrent: entry.currentWeights === 'pretrained'
      });
    }

    // Add all trained versions
    for (let i = 0; i < entry.trainedPaths.length; i++) {
      const metadata = entry.trainedMetadata?.[i];
      if (metadata) {
        versions.push({
          type: 'trained' as const,
          date: metadata.date_stamp || metadata.created,
          version: metadata.version,
          path: entry.trainedPaths[i],
          isCurrent: entry.currentWeights === entry.trainedPaths[i]
        });
      }
    }

    return versions;
  }
}

// Export singleton instance
export const weightManager = WeightManagerSystem.getInstance();

// Auto-initialize on import (optional - can be called explicitly)
if (typeof window === 'undefined') {
  // Only auto-initialize in Node.js environment (server-side)
  weightManager.initialize().catch(error => {
    console.error('Failed to auto-initialize Weight Manager:', error);
  });
}
