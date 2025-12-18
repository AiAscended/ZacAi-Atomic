/**
 * GitHub Backup Integration
 * Manages automated backups to configured GitHub repositories
 * Supports multiple repository types: backup, data_library, stable, enhanced, experimental
 */

import { promises as fs } from "fs";
import * as path from "path";
import { execSync } from "child_process";

export interface GitHubRepository {
  name: string;
  owner: string;
  type: "backup" | "data_library" | "stable" | "enhanced" | "experimental";
  url: string;
  branch: string;
  enabled: boolean;
  lastBackup?: string;
  autoBackup?: boolean;
  backupSchedule?: "hourly" | "daily" | "weekly" | "monthly";
}

export interface BackupConfig {
  repositories: GitHubRepository[];
  defaultBranch: string;
  commitMessage: string;
  autoBackupEnabled: boolean;
  excludePatterns: string[];
}

interface RepositoryStats {
  name: string;
  type: GitHubRepository['type'];
  enabled: boolean;
  lastBackup?: string;
  autoBackup?: boolean;
  schedule?: GitHubRepository['backupSchedule'];
}

interface BackupStatistics {
  totalRepositories: number;
  enabledRepositories: number;
  autoBackupEnabled: boolean;
  repositories: RepositoryStats[];
}

export class GitHubBackupManager {
  private configPath: string;
  private config: BackupConfig | null = null;

  constructor(configPath?: string) {
    this.configPath =
      configPath ||
      path.join(__dirname, "../../../data/github-backup-config.json");
  }

  /**
   * Initialize the backup system
   */
  async initialize(): Promise<void> {
    try {
      // Try to load existing config
      const data = await fs.readFile(this.configPath, "utf-8");
      this.config = JSON.parse(data);
    } catch {
      // Create default config
      this.config = {
        repositories: [
          {
            name: "ZacAi-Backup",
            owner: "AiAscended",
            type: "backup",
            url: "",
            branch: "main",
            enabled: false,
            autoBackup: true,
            backupSchedule: "daily",
          },
          {
            name: "ZacAi-DataLibrary",
            owner: "AiAscended",
            type: "data_library",
            url: "",
            branch: "main",
            enabled: false,
            autoBackup: true,
            backupSchedule: "weekly",
          },
          {
            name: "ZacAi-Stable",
            owner: "AiAscended",
            type: "stable",
            url: "",
            branch: "main",
            enabled: false,
            autoBackup: false,
          },
          {
            name: "ZacAi-Enhanced",
            owner: "AiAscended",
            type: "enhanced",
            url: "",
            branch: "main",
            enabled: false,
            autoBackup: false,
          },
          {
            name: "ZacAi-Experimental",
            owner: "AiAscended",
            type: "experimental",
            url: "",
            branch: "dev",
            enabled: false,
            autoBackup: false,
          },
        ],
        defaultBranch: "main",
        commitMessage: "Automated backup: {{date}}",
        autoBackupEnabled: false,
        excludePatterns: [
          "node_modules/",
          ".next/",
          ".git/",
          "*.log",
          "tmp/",
          "cache/",
        ],
      };

      await this.saveConfig();
    }

    console.log("✅ GitHub Backup Manager initialized");
  }

  /**
   * Save configuration
   */
  async saveConfig(): Promise<void> {
    if (!this.config) return;
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Get all repositories
   */
  getRepositories(): GitHubRepository[] {
    return this.config?.repositories || [];
  }

  /**
   * Add or update repository
   */
  async addRepository(repo: GitHubRepository): Promise<void> {
    if (!this.config) await this.initialize();
    if (!this.config) return;

    const existingIndex = this.config.repositories.findIndex(
      (r) => r.name === repo.name && r.owner === repo.owner,
    );

    if (existingIndex >= 0) {
      this.config.repositories[existingIndex] = repo;
    } else {
      this.config.repositories.push(repo);
    }

    await this.saveConfig();
  }

  /**
   * Enable/disable repository
   */
  async toggleRepository(name: string, enabled: boolean): Promise<void> {
    if (!this.config) await this.initialize();
    if (!this.config) return;

    const repo = this.config.repositories.find((r) => r.name === name);
    if (repo) {
      repo.enabled = enabled;
      await this.saveConfig();
    }
  }

  /**
   * Backup to specific repository
   */
  async backupToRepository(
    repoName: string,
    sourcePath: string,
  ): Promise<boolean> {
    if (!this.config) await this.initialize();
    if (!this.config) return false;

    const repo = this.config.repositories.find((r) => r.name === repoName);
    if (!repo || !repo.enabled) {
      console.warn(`Repository ${repoName} not found or not enabled`);
      return false;
    }

    try {
      // Prepare backup directory
      const backupDir = path.join("/tmp", `backup-${Date.now()}`);
      await fs.mkdir(backupDir, { recursive: true });

      // Copy files to backup directory
      await this.copyWithExclusions(
        sourcePath,
        backupDir,
        this.config.excludePatterns,
      );

      // Initialize git if needed
      const gitDir = path.join(backupDir, ".git");
      try {
        await fs.access(gitDir);
      } catch {
        execSync("git init", { cwd: backupDir });
        if (repo.url) {
          execSync(`git remote add origin ${repo.url}`, { cwd: backupDir });
        }
      }

      // Configure git
      execSync('git config user.name "ZacAi Automated Backup"', {
        cwd: backupDir,
      });
      execSync('git config user.email "backup@zacai.ai"', { cwd: backupDir });

      // Add files
      execSync("git add .", { cwd: backupDir });

      // Commit
      const commitMsg = this.config.commitMessage.replace(
        "{{date}}",
        new Date().toISOString(),
      );
      execSync(`git commit -m "${commitMsg}"`, { cwd: backupDir });

      // Push (if URL is configured)
      if (repo.url) {
        execSync(`git push origin ${repo.branch}`, { cwd: backupDir });
        console.log(`✅ Backed up to ${repoName}`);
      } else {
        console.log(
          `⚠️ Repository ${repoName} has no URL configured - local commit only`,
        );
      }

      // Update last backup time
      repo.lastBackup = new Date().toISOString();
      await this.saveConfig();

      // Cleanup
      await this.rmrf(backupDir);

      return true;
    } catch (error) {
      console.error(`❌ Backup to ${repoName} failed:`, error);
      return false;
    }
  }

  /**
   * Backup learned data to data_library repository
   */
  async backupLearnedData(): Promise<boolean> {
    const repo = this.config?.repositories.find(
      (r) => r.type === "data_library",
    );
    if (!repo || !repo.enabled) return false;

    const learnedPath = path.join(
      __dirname,
      "../../../data/learning-memory/learned",
    );
    return await this.backupToRepository(repo.name, learnedPath);
  }

  /**
   * Backup archived data
   */
  async backupArchivedData(): Promise<boolean> {
    const repo = this.config?.repositories.find((r) => r.type === "backup");
    if (!repo || !repo.enabled) return false;

    const archivePath = path.join(
      __dirname,
      "../../../data/learning-memory/archive",
    );
    return await this.backupToRepository(repo.name, archivePath);
  }

  /**
   * Run scheduled backups
   */
  async runScheduledBackups(): Promise<void> {
    if (!this.config?.autoBackupEnabled) return;

    for (const repo of this.config.repositories) {
      if (!repo.enabled || !repo.autoBackup) continue;

      const shouldBackup = this.shouldRunBackup(repo);
      if (shouldBackup) {
        let sourcePath: string;

        switch (repo.type) {
          case "data_library":
            sourcePath = path.join(
              __dirname,
              "../../../data/learning-memory/learned",
            );
            break;
          case "backup":
            sourcePath = path.join(
              __dirname,
              "../../../data/learning-memory/archive",
            );
            break;
          case "stable":
          case "enhanced":
          case "experimental":
            sourcePath = path.join(__dirname, "../../..");
            break;
          default:
            continue;
        }

        await this.backupToRepository(repo.name, sourcePath);
      }
    }
  }

  /**
   * Check if backup should run based on schedule
   */
  private shouldRunBackup(repo: GitHubRepository): boolean {
    if (!repo.lastBackup || !repo.backupSchedule) return true;

    const lastBackup = new Date(repo.lastBackup);
    const now = new Date();
    const hoursSince =
      (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);

    switch (repo.backupSchedule) {
      case "hourly":
        return hoursSince >= 1;
      case "daily":
        return hoursSince >= 24;
      case "weekly":
        return hoursSince >= 168;
      case "monthly":
        return hoursSince >= 720;
      default:
        return false;
    }
  }

  /**
   * Copy files with exclusion patterns
   */
  private async copyWithExclusions(
    src: string,
    dest: string,
    excludePatterns: string[],
  ): Promise<void> {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Check if path matches exclusion pattern
      const relativePath = path.relative(src, srcPath);
      const shouldExclude = excludePatterns.some((pattern) => {
        if (pattern.endsWith("/")) {
          return relativePath.startsWith(pattern.slice(0, -1));
        }
        return relativePath.includes(pattern.replace("*", ""));
      });

      if (shouldExclude) continue;

      if (entry.isDirectory()) {
        await this.copyWithExclusions(srcPath, destPath, excludePatterns);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Recursive remove
   */
  private async rmrf(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await this.rmrf(fullPath);
        } else {
          await fs.unlink(fullPath);
        }
      }
      await fs.rmdir(dir);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get backup statistics
   */
  async getStatistics(): Promise<unknown> {
    if (!this.config) await this.initialize();

    const config = this.config;
    if (!config) {
      return {
        totalRepositories: 0,
        enabledRepositories: 0,
        autoBackupEnabled: false,
        repositories: [],
      };
    }

    return {
      totalRepositories: this.config?.repositories.length || 0,
      enabledRepositories:
        this.config?.repositories.filter((r) => r.enabled).length || 0,
      autoBackupEnabled: this.config?.autoBackupEnabled || false,
      repositories: this.config?.repositories.map((r) => ({
        name: r.name,
        type: r.type,
        enabled: r.enabled,
        lastBackup: r.lastBackup,
        autoBackup: r.autoBackup,
        schedule: r.backupSchedule,
      })),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let githubBackupManager: GitHubBackupManager | null = null;

export function getGitHubBackupManager(): GitHubBackupManager {
  if (!githubBackupManager) {
    githubBackupManager = new GitHubBackupManager();
    githubBackupManager.initialize().catch(console.error);
  }
  return githubBackupManager;
}
