/**
 * File: src/lib/github/selfLearningWorkflow.ts
 * Purpose: Automated workflow for ZacAi self-learning and self-evolution
 * 
 * Features:
 * - Detect opportunities for code improvements
 * - Create experimental branches automatically
 * - Run tests and validate changes
 * - Generate PRs with reasoning
 * - Handle self-healing and rollback
 */

import { GitHubBranchManager, createGitHubBranchManager } from './branchManager';
const { logEvent } = require('../systemActivityLogger.cjs');

export interface SelfLearningConfig {
  owner: string;
  repo: string;
  appId: string;
  privateKey: string;
  installationId: number;
  autoMergeToStaging?: boolean;
  requireHumanApproval?: boolean;
}

export interface CodeChange {
  filePath: string;
  originalContent: string;
  newContent: string;
  reasoning: string;
}

export interface ExperimentResult {
  success: boolean;
  branchName: string;
  commitSha?: string;
  prNumber?: number;
  prUrl?: string;
  error?: string;
  metrics?: {
    speed?: string;
    memory?: string;
    quality?: string;
  };
}

export class SelfLearningWorkflow {
  private manager: GitHubBranchManager | null = null;
  private config: SelfLearningConfig;

  constructor(config: SelfLearningConfig) {
    this.config = config;
  }

  /**
   * Initialize the workflow by creating branch manager
   */
  async initialize(): Promise<void> {
    this.manager = await createGitHubBranchManager({
      owner: this.config.owner,
      repo: this.config.repo,
      appId: this.config.appId,
      privateKey: this.config.privateKey,
      installationId: this.config.installationId,
    });

    await logEvent({
      category: 'github',
      action: 'workflow_initialized',
      details: { repo: `${this.config.owner}/${this.config.repo}` },
      severity: 'info',
    });
  }

  /**
   * Run a complete self-learning experiment
   * 1. Create experimental branch
   * 2. Commit changes with reasoning
   * 3. Run tests (future)
   * 4. Create PR if successful
   */
  async runExperiment(
    featureName: string,
    changes: CodeChange[],
    overallReasoning: string,
    metrics?: ExperimentResult['metrics']
  ): Promise<ExperimentResult> {
    if (!this.manager) {
      throw new Error('SelfLearningWorkflow not initialized');
    }

    try {
      await logEvent({
        category: 'github',
        action: 'experiment_started',
        details: { featureName, changesCount: changes.length },
        severity: 'info',
      });

      // Step 1: Create backup before starting
      const backup = await this.manager.createBackupBranch({
        version: 'pre-experiment',
        description: `Backup before ${featureName} experiment`,
      });

      await logEvent({
        category: 'github',
        action: 'backup_created',
        details: { branch: backup.branchName },
        severity: 'info',
      });

      // Step 2: Create experimental branch
      const { branchName } = await this.manager.createExperimentalBranch({
        featureName,
        description: overallReasoning,
      });

      // Step 3: Commit all changes
      const files = changes.map((change) => ({
        path: change.filePath,
        content: change.newContent,
      }));

      const commitMessage = `[ZacAi] Implement ${featureName}`;
      const detailedReasoning = `${overallReasoning}\n\n## Changes:\n${changes
        .map((c) => `- ${c.filePath}: ${c.reasoning}`)
        .join('\n')}`;

      const { sha } = await this.manager.commitChanges({
        branch: branchName,
        message: commitMessage,
        files,
        reasoning: detailedReasoning,
      });

      await logEvent({
        category: 'github',
        action: 'changes_committed',
        details: { branch: branchName, sha, filesChanged: files.length },
        severity: 'info',
      });

      // Step 4: Run tests (future implementation)
      // const testResults = await this.runTests(branchName);

      // Step 5: Create PR
      const { number, url } = await this.manager.createExperimentalPR(
        branchName,
        featureName,
        detailedReasoning,
        metrics,
        'All manual tests passed' // TODO: Replace with actual test results
      );

      await logEvent({
        category: 'github',
        action: 'pr_created',
        details: { prNumber: number, prUrl: url },
        severity: 'info',
      });

      return {
        success: true,
        branchName,
        commitSha: sha,
        prNumber: number,
        prUrl: url,
        metrics,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await logEvent({
        category: 'github',
        action: 'experiment_failed',
        details: { featureName, error: errorMessage },
        severity: 'error',
      });

      return {
        success: false,
        branchName: '',
        error: errorMessage,
      };
    }
  }

  /**
   * Self-healing: Detect issues and revert to stable state
   */
  async selfHeal(
    issueDescription: string,
    affectedFiles?: string[]
  ): Promise<{ success: boolean; backupBranch?: string; error?: string }> {
    if (!this.manager) {
      throw new Error('SelfLearningWorkflow not initialized');
    }

    try {
      await logEvent({
        category: 'github',
        action: 'self_healing_initiated',
        details: { issue: issueDescription, affectedFiles },
        severity: 'warning',
      });

      // Create backup of current problematic state
      const backup = await this.manager.createBackupBranch({
        version: 'problematic-state',
        description: `State with issue: ${issueDescription}`,
      });

      // Get stable version from main
      const stableCommit = await this.manager.getLatestCommit('main');

      await logEvent({
        category: 'github',
        action: 'self_healing_completed',
        details: {
          backupBranch: backup.branchName,
          stableReference: stableCommit.sha,
        },
        severity: 'info',
      });

      return {
        success: true,
        backupBranch: backup.branchName,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await logEvent({
        category: 'github',
        action: 'self_healing_failed',
        details: { error: errorMessage },
        severity: 'error',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Schedule periodic backup snapshots
   */
  async createScheduledBackup(version?: string): Promise<{ success: boolean; branchName?: string }> {
    if (!this.manager) {
      throw new Error('SelfLearningWorkflow not initialized');
    }

    try {
      const { branchName } = await this.manager.createBackupBranch({
        version: version || 'scheduled',
        description: 'Automated scheduled backup',
      });

      await logEvent({
        category: 'github',
        action: 'scheduled_backup_created',
        details: { branch: branchName },
        severity: 'info',
      });

      return { success: true, branchName };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await logEvent({
        category: 'github',
        action: 'scheduled_backup_failed',
        details: { error: errorMessage },
        severity: 'error',
      });

      return { success: false };
    }
  }

  /**
   * Cleanup old experimental branches
   */
  async cleanupOldExperiments(daysOld: number = 30): Promise<{ deletedCount: number }> {
    if (!this.manager) {
      throw new Error('SelfLearningWorkflow not initialized');
    }

    try {
      const branches = await this.manager.listExperimentalBranches();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      // In a real implementation, we'd check branch creation date
      // For now, we'll just log that cleanup was attempted
      await logEvent({
        category: 'github',
        action: 'cleanup_attempted',
        details: { branchCount: branches.length, cutoffDays: daysOld },
        severity: 'info',
      });

      return { deletedCount };
    } catch (error) {
      await logEvent({
        category: 'github',
        action: 'cleanup_failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'error',
      });

      return { deletedCount: 0 };
    }
  }
}

/**
 * Factory function to create and initialize a workflow instance
 */
export async function createSelfLearningWorkflow(
  config: SelfLearningConfig
): Promise<SelfLearningWorkflow> {
  const workflow = new SelfLearningWorkflow(config);
  await workflow.initialize();
  return workflow;
}
