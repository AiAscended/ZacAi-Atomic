/**
 * File: src/lib/github/branchManager.ts
 * Purpose: GitHub branch management service for ZacAi self-learning workflows
 * 
 * Features:
 * - Create experimental/backup branches
 * - Commit changes with reasoning logs
 * - Create pull requests with diagnostics
 * - Handle rollback scenarios
 * - Integrate with GitHub App authentication
 */

import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export interface BranchManagerConfig {
  owner: string;
  repo: string;
  appId: string;
  privateKey: string;
  installationId: number;
}

export interface ExperimentalBranchOptions {
  featureName: string;
  baseBranch?: string;
  description?: string;
}

export interface CommitOptions {
  branch: string;
  message: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  reasoning?: string;
}

export interface PullRequestOptions {
  branch: string;
  title: string;
  body: string;
  baseBranch?: string;
  labels?: string[];
  autoMerge?: boolean;
}

export interface BackupBranchOptions {
  version?: string;
  description?: string;
}

export class GitHubBranchManager {
  private octokit: Octokit;
  private config: BranchManagerConfig;
  private initialized = false;

  constructor(config: BranchManagerConfig) {
    this.config = config;
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.appId,
        privateKey: config.privateKey,
        installationId: config.installationId,
      },
    });
  }

  /**
   * Initialize the branch manager by verifying GitHub App installation
   */
  async initialize(): Promise<void> {
    try {
      // Verify we can access the repository
      const { data: repo } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });

      this.initialized = true;
      console.log(`GitHubBranchManager initialized for ${repo.full_name}`);
    } catch (error) {
      console.error("Failed to initialize GitHubBranchManager:", error);
      throw new Error("Failed to verify GitHub App installation");
    }
  }

  /**
   * Create an experimental branch for testing new features
   */
  async createExperimentalBranch(
    options: ExperimentalBranchOptions
  ): Promise<{ branchName: string; sha: string }> {
    this.ensureInitialized();

    const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const branchName = `zacai-experiment-${options.featureName}-${timestamp}`;
    const baseBranch = options.baseBranch || "main";

    try {
      // Get the SHA of the base branch
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${baseBranch}`,
      });

      // Create new branch
      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${branchName}`,
        sha: ref.object.sha,
      });

      console.log(`Created experimental branch: ${branchName}`);
      return { branchName, sha: ref.object.sha };
    } catch (error) {
      console.error("Failed to create experimental branch:", error);
      throw new Error(`Failed to create branch ${branchName}`);
    }
  }

  /**
   * Create a backup branch as a snapshot
   */
  async createBackupBranch(
    options: BackupBranchOptions = {}
  ): Promise<{ branchName: string; sha: string }> {
    this.ensureInitialized();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const version = options.version || "snapshot";
    const branchName = `zacai-backup-${version}-${timestamp}`;

    try {
      // Get the SHA of main branch
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: "heads/main",
      });

      // Create backup branch
      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${branchName}`,
        sha: ref.object.sha,
      });

      console.log(`Created backup branch: ${branchName}`);
      return { branchName, sha: ref.object.sha };
    } catch (error) {
      console.error("Failed to create backup branch:", error);
      throw new Error(`Failed to create backup ${branchName}`);
    }
  }

  /**
   * Commit changes to a branch with reasoning documentation
   */
  async commitChanges(options: CommitOptions): Promise<{ sha: string }> {
    this.ensureInitialized();

    try {
      // Get the current commit SHA
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${options.branch}`,
      });

      const currentSha = ref.object.sha;

      // Get the base tree
      const { data: commit } = await this.octokit.git.getCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        commit_sha: currentSha,
      });

      // Create blobs for each file
      const tree = await Promise.all(
        options.files.map(async (file) => {
          const { data: blob } = await this.octokit.git.createBlob({
            owner: this.config.owner,
            repo: this.config.repo,
            content: Buffer.from(file.content).toString("base64"),
            encoding: "base64",
          });

          return {
            path: file.path,
            mode: "100644" as const,
            type: "blob" as const,
            sha: blob.sha,
          };
        })
      );

      // Create new tree
      const { data: newTree } = await this.octokit.git.createTree({
        owner: this.config.owner,
        repo: this.config.repo,
        base_tree: commit.tree.sha,
        tree,
      });

      // Create commit with reasoning
      const commitMessage = options.reasoning
        ? `${options.message}\n\n## ZacAi Reasoning\n${options.reasoning}`
        : options.message;

      const { data: newCommit } = await this.octokit.git.createCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [currentSha],
      });

      // Update the reference
      await this.octokit.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${options.branch}`,
        sha: newCommit.sha,
      });

      console.log(`Committed changes to ${options.branch}: ${newCommit.sha}`);
      return { sha: newCommit.sha };
    } catch (error) {
      console.error("Failed to commit changes:", error);
      throw new Error(`Failed to commit to branch ${options.branch}`);
    }
  }

  /**
   * Create a pull request with diagnostic information
   */
  async createPullRequest(
    options: PullRequestOptions
  ): Promise<{ number: number; url: string }> {
    this.ensureInitialized();

    const baseBranch = options.baseBranch || "main";

    try {
      const { data: pr } = await this.octokit.pulls.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title: options.title,
        head: options.branch,
        base: baseBranch,
        body: options.body,
      });

      // Add labels if provided
      if (options.labels && options.labels.length > 0) {
        await this.octokit.issues.addLabels({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: pr.number,
          labels: options.labels,
        });
      }

      // Enable auto-merge if requested and all checks pass
      if (options.autoMerge) {
        // Note: Auto-merge requires GraphQL API and specific repository settings
        console.log(`Auto-merge requested for PR #${pr.number}`);
      }

      console.log(`Created PR #${pr.number}: ${pr.html_url}`);
      return { number: pr.number, url: pr.html_url };
    } catch (error) {
      console.error("Failed to create pull request:", error);
      throw new Error(`Failed to create PR from ${options.branch}`);
    }
  }

  /**
   * Get the latest commit SHA from a branch
   */
  async getLatestCommit(branch: string): Promise<{ sha: string; message: string }> {
    this.ensureInitialized();

    try {
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branch}`,
      });

      const { data: commit } = await this.octokit.git.getCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        commit_sha: ref.object.sha,
      });

      return { sha: commit.sha, message: commit.message };
    } catch (error) {
      console.error(`Failed to get latest commit from ${branch}:`, error);
      throw new Error(`Failed to get commit from branch ${branch}`);
    }
  }

  /**
   * List all experimental branches
   */
  async listExperimentalBranches(): Promise<
    Array<{ name: string; sha: string; protected: boolean }>
  > {
    this.ensureInitialized();

    try {
      const { data: branches } = await this.octokit.repos.listBranches({
        owner: this.config.owner,
        repo: this.config.repo,
        per_page: 100,
      });

      return branches
        .filter((b) => b.name.startsWith("zacai-experiment-"))
        .map((b) => ({
          name: b.name,
          sha: b.commit.sha,
          protected: b.protected,
        }));
    } catch (error) {
      console.error("Failed to list experimental branches:", error);
      throw new Error("Failed to list branches");
    }
  }

  /**
   * Delete an experimental branch (cleanup)
   */
  async deleteExperimentalBranch(branchName: string): Promise<void> {
    this.ensureInitialized();

    if (!branchName.startsWith("zacai-experiment-")) {
      throw new Error("Can only delete experimental branches");
    }

    try {
      await this.octokit.git.deleteRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branchName}`,
      });

      console.log(`Deleted experimental branch: ${branchName}`);
    } catch (error) {
      console.error(`Failed to delete branch ${branchName}:`, error);
      throw new Error(`Failed to delete branch ${branchName}`);
    }
  }

  /**
   * Create a comprehensive PR for an experimental feature
   */
  async createExperimentalPR(
    branchName: string,
    featureName: string,
    reasoning: string,
    metrics?: {
      speed?: string;
      memory?: string;
      quality?: string;
    },
    testResults?: string
  ): Promise<{ number: number; url: string }> {
    const body = `## ZacAi Experimental Feature: ${featureName}

### Reasoning
${reasoning}

### Changes Made
Changes are available in the commits on this branch. Each commit includes detailed reasoning in the commit message.

${
  metrics
    ? `### Performance Impact
- **Speed:** ${metrics.speed || "N/A"}
- **Memory:** ${metrics.memory || "N/A"}
- **Quality:** ${metrics.quality || "N/A"}`
    : ""
}

${
  testResults
    ? `### Test Results
${testResults}`
    : ""
}

### Rollback Plan
This is an experimental branch. If issues are detected, simply close this PR and the main branch remains unchanged.

---
*This PR was automatically created by ZacAi's self-learning system.*
`;

    return this.createPullRequest({
      branch: branchName,
      title: `[ZacAi] ${featureName}`,
      body,
      labels: ["zacai-experiment", "needs-review"],
    });
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("GitHubBranchManager not initialized. Call initialize() first.");
    }
  }
}

/**
 * Factory function to create and initialize a GitHubBranchManager instance
 */
export async function createGitHubBranchManager(
  config: BranchManagerConfig
): Promise<GitHubBranchManager> {
  const manager = new GitHubBranchManager(config);
  await manager.initialize();
  return manager;
}
