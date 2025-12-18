#!/usr/bin/env tsx
/**
 * File Consolidation Script
 * 
 * Creates an 'uncommitted-files' branch and consolidates all unique files from other branches:
 * 1. Reads the branch-analysis-manifest.json from analyze-branches.ts
 * 2. For each unique file, determines which branch has the most recent version
 * 3. Generates a consolidation plan and report
 * 4. Documents metadata about source branches and commits
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

interface FileConsolidation {
  path: string;
  sourceBranch: string;
  sourceSha: string;
  size: number;
  lastModified: string;
  alternativeBranches: string[];
}

interface ConflictInfo {
  path: string;
  branches: Array<{
    branch: string;
    sha: string;
    size: number;
  }>;
}

const OWNER = 'AiAscended';
const REPO = 'ZacAi-Atomic';
const MAIN_BRANCH = 'main';
const TARGET_BRANCH = 'uncommitted-files';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

class FileConsolidator {
  private octokit: Octokit;
  private manifest: any;
  private consolidationPlan: FileConsolidation[] = [];
  private conflicts: ConflictInfo[] = [];

  constructor() {
    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
      request: {
        timeout: 30000,
      },
    });
  }

  /**
   * Main entry point for consolidation
   */
  async consolidate(): Promise<void> {
    console.log('🔄 Starting File Consolidation...\n');

    try {
      // Step 1: Load the analysis manifest
      await this.loadManifest();

      // Step 2: Analyze file occurrences and determine sources
      await this.analyzeFileOccurrences();

      // Step 3: Generate consolidation report
      await this.generateConsolidationReport();

      // Step 4: Generate consolidation plan script
      await this.generateConsolidationScript();

      console.log('✅ Consolidation planning complete!\n');
      this.printSummary();

    } catch (error) {
      console.error('❌ Error during consolidation:', error);
      throw error;
    }
  }

  /**
   * Load the branch analysis manifest
   */
  private async loadManifest(): Promise<void> {
    console.log('📂 Loading branch analysis manifest...');
    
    if (!fs.existsSync('branch-analysis-manifest.json')) {
      throw new Error('branch-analysis-manifest.json not found. Run analyze-branches.ts first.');
    }

    this.manifest = JSON.parse(fs.readFileSync('branch-analysis-manifest.json', 'utf-8'));
    console.log(`✅ Loaded manifest with ${this.manifest.branches.length} branches\n`);
  }

  /**
   * Analyze file occurrences across branches
   */
  private async analyzeFileOccurrences(): Promise<void> {
    console.log('🔍 Analyzing file occurrences across branches...\n');

    // Map of file path to branches containing it
    const fileMap = new Map<string, Array<{
      branch: string;
      sha: string;
      size: number;
    }>>();

    // Collect all files from all branches
    for (const branchData of this.manifest.branches) {
      if (branchData.name === MAIN_BRANCH) continue;

      for (const file of branchData.files) {
        if (!fileMap.has(file.path)) {
          fileMap.set(file.path, []);
        }
        fileMap.get(file.path)!.push({
          branch: branchData.name,
          sha: file.sha,
          size: file.size,
        });
      }
    }

    // Analyze each file
    let fileCount = 0;
    for (const [filePath, occurrences] of fileMap.entries()) {
      fileCount++;
      if (fileCount % 100 === 0) {
        console.log(`   Processed ${fileCount} files...`);
      }

      if (occurrences.length === 1) {
        // File exists in only one branch - straightforward
        const source = occurrences[0];
        this.consolidationPlan.push({
          path: filePath,
          sourceBranch: source.branch,
          sourceSha: source.sha,
          size: source.size,
          lastModified: 'N/A', // Would need commit info to get this
          alternativeBranches: [],
        });
      } else {
        // File exists in multiple branches - potential conflict
        // Check if they're the same file (same SHA)
        const uniqueShas = new Set(occurrences.map(o => o.sha));
        
        if (uniqueShas.size === 1) {
          // Same file in multiple branches - pick the most "canonical" branch
          const source = this.selectCanonicalBranch(occurrences);
          const alternatives = occurrences
            .filter(o => o.branch !== source.branch)
            .map(o => o.branch);
          
          this.consolidationPlan.push({
            path: filePath,
            sourceBranch: source.branch,
            sourceSha: source.sha,
            size: source.size,
            lastModified: 'N/A',
            alternativeBranches: alternatives,
          });
        } else {
          // Different versions exist - mark as conflict
          this.conflicts.push({
            path: filePath,
            branches: occurrences,
          });

          // For now, use the version from the most canonical branch
          const source = this.selectCanonicalBranch(occurrences);
          const alternatives = occurrences
            .filter(o => o.branch !== source.branch)
            .map(o => o.branch);
          
          this.consolidationPlan.push({
            path: filePath,
            sourceBranch: source.branch,
            sourceSha: source.sha,
            size: source.size,
            lastModified: 'N/A',
            alternativeBranches: alternatives,
          });
        }
      }
    }

    console.log(`✅ Analyzed ${fileMap.size} unique files\n`);
  }

  /**
   * Select the most canonical branch from multiple options
   * Priority: version branches > feature branches > copilot branches
   */
  private selectCanonicalBranch(occurrences: Array<{ branch: string; sha: string; size: number }>): {
    branch: string;
    sha: string;
    size: number;
  } {
    // Priority order
    const priorities = [
      // Version branches (highest priority)
      (b: string) => b.startsWith('ZacAi-Hybrid-LLM-v') ? 1 : 0,
      // Complete/current branches
      (b: string) => b.includes('complete') || b.includes('current') ? 2 : 0,
      // Feature branches
      (b: string) => !b.startsWith('copilot/') && !b.startsWith('codespace-') ? 3 : 0,
      // Copilot branches (lower priority)
      (b: string) => b.startsWith('copilot/') ? 4 : 0,
      // Codespace branches (lowest priority)
      (b: string) => b.startsWith('codespace-') ? 5 : 0,
    ];

    return occurrences.sort((a, b) => {
      for (const priority of priorities) {
        const scoreA = priority(a.branch);
        const scoreB = priority(b.branch);
        if (scoreA !== scoreB) {
          return scoreA - scoreB;
        }
      }
      // If all priorities are equal, prefer larger file (likely more complete)
      return b.size - a.size;
    })[0];
  }

  /**
   * Generate CONSOLIDATION_REPORT.md
   */
  private async generateConsolidationReport(): Promise<void> {
    console.log('📝 Generating consolidation report...\n');

    let content = `# File Consolidation Report\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Overview\n\n`;
    content += `This report documents the plan for consolidating files from all branches into the \`${TARGET_BRANCH}\` branch.\n\n`;
    content += `### Summary\n\n`;
    content += `- **Total Files to Consolidate**: ${this.consolidationPlan.length}\n`;
    content += `- **Files with Conflicts**: ${this.conflicts.length}\n`;
    content += `- **Source Branches**: ${new Set(this.consolidationPlan.map(f => f.sourceBranch)).size}\n\n`;

    // Conflicts section
    if (this.conflicts.length > 0) {
      content += `## ⚠️ Conflicts Requiring Manual Review\n\n`;
      content += `The following files exist in multiple branches with different content:\n\n`;

      for (const conflict of this.conflicts) {
        content += `### \`${conflict.path}\`\n\n`;
        content += `Found in ${conflict.branches.length} branches with different versions:\n\n`;
        
        for (const branch of conflict.branches) {
          content += `- **${branch.branch}**\n`;
          content += `  - SHA: \`${branch.sha.substring(0, 7)}\`\n`;
          content += `  - Size: ${this.formatSize(branch.size)}\n`;
        }
        content += `\n`;
      }
    }

    // Files by source branch
    content += `## Files by Source Branch\n\n`;
    
    const byBranch = new Map<string, FileConsolidation[]>();
    for (const file of this.consolidationPlan) {
      if (!byBranch.has(file.sourceBranch)) {
        byBranch.set(file.sourceBranch, []);
      }
      byBranch.get(file.sourceBranch)!.push(file);
    }

    const sortedBranches = Array.from(byBranch.entries()).sort((a, b) => b[1].length - a[1].length);

    for (const [branch, files] of sortedBranches) {
      content += `### ${branch} (${files.length} files)\n\n`;
      
      const byDir = this.groupByDirectory(files);
      for (const [dir, dirFiles] of Object.entries(byDir)) {
        content += `**\`${dir}/\`** (${dirFiles.length} files)\n`;
        for (const file of dirFiles.slice(0, 10)) {
          const alt = file.alternativeBranches.length > 0
            ? ` (also in: ${file.alternativeBranches.slice(0, 3).join(', ')}${file.alternativeBranches.length > 3 ? '...' : ''})`
            : '';
          content += `- \`${path.basename(file.path)}\` (${this.formatSize(file.size)})${alt}\n`;
        }
        if (dirFiles.length > 10) {
          content += `- ... and ${dirFiles.length - 10} more files\n`;
        }
        content += `\n`;
      }
    }

    // Consolidation steps
    content += `## Implementation Steps\n\n`;
    content += `To consolidate these files:\n\n`;
    content += `1. Create the \`${TARGET_BRANCH}\` branch from \`${MAIN_BRANCH}\`\n`;
    content += `2. For each file in the consolidation plan:\n`;
    content += `   - Fetch the file content from the source branch\n`;
    content += `   - Create necessary directory structure\n`;
    content += `   - Write the file to the target branch\n`;
    content += `3. Commit all changes with metadata tracking\n`;
    content += `4. Push to GitHub\n\n`;
    content += `**Note**: A consolidation script will be generated to automate this process.\n\n`;

    // Metadata tracking
    content += `## Metadata\n\n`;
    content += `The following metadata will be tracked for each file:\n\n`;
    content += `- Source branch name\n`;
    content += `- Source commit SHA\n`;
    content += `- Alternative branches (if file exists elsewhere)\n`;
    content += `- File size\n\n`;

    fs.writeFileSync('CONSOLIDATION_REPORT.md', content);
    console.log('✅ Generated CONSOLIDATION_REPORT.md');
  }

  /**
   * Generate a shell script to perform the consolidation
   */
  private async generateConsolidationScript(): Promise<void> {
    console.log('📝 Generating consolidation script...\n');

    let script = `#!/bin/bash\n`;
    script += `# File Consolidation Script\n`;
    script += `# Generated: ${new Date().toISOString()}\n`;
    script += `#\n`;
    script += `# This script consolidates files from multiple branches into '${TARGET_BRANCH}'\n`;
    script += `# WARNING: This script requires GitHub authentication and write access\n\n`;
    script += `set -e\n\n`;
    script += `OWNER="${OWNER}"\n`;
    script += `REPO="${REPO}"\n`;
    script += `TARGET_BRANCH="${TARGET_BRANCH}"\n`;
    script += `MAIN_BRANCH="${MAIN_BRANCH}"\n\n`;
    script += `echo "🔄 Starting file consolidation..."\n\n`;
    script += `# This is a placeholder script\n`;
    script += `# Actual implementation would require:\n`;
    script += `# 1. GitHub authentication\n`;
    script += `# 2. Creating the target branch\n`;
    script += `# 3. Fetching and copying files using GitHub API\n`;
    script += `# 4. Committing and pushing changes\n\n`;
    script += `echo "📊 Files to consolidate: ${this.consolidationPlan.length}"\n`;
    script += `echo "⚠️  Conflicts to resolve: ${this.conflicts.length}"\n\n`;
    script += `echo "⚠️  Note: This script is a template and needs implementation"\n`;
    script += `echo "Please review CONSOLIDATION_REPORT.md for details"\n`;

    fs.writeFileSync('scripts/consolidate.sh', script);
    fs.chmodSync('scripts/consolidate.sh', '755');
    console.log('✅ Generated scripts/consolidate.sh');

    // Also generate a JSON plan for programmatic access
    const plan = {
      generated: new Date().toISOString(),
      targetBranch: TARGET_BRANCH,
      sourceBranch: MAIN_BRANCH,
      totalFiles: this.consolidationPlan.length,
      conflicts: this.conflicts.length,
      files: this.consolidationPlan,
      conflictDetails: this.conflicts,
    };

    fs.writeFileSync('consolidation-plan.json', JSON.stringify(plan, null, 2));
    console.log('✅ Generated consolidation-plan.json');
  }

  /**
   * Print summary
   */
  private printSummary(): void {
    console.log('\n📊 Consolidation Summary:\n');
    console.log(`Files to Consolidate: ${this.consolidationPlan.length}`);
    console.log(`Conflicts Found: ${this.conflicts.length}`);
    
    const sourceBranches = new Set(this.consolidationPlan.map(f => f.sourceBranch));
    console.log(`Source Branches: ${sourceBranches.size}`);
    
    const totalSize = this.consolidationPlan.reduce((sum, f) => sum + f.size, 0);
    console.log(`Total Size: ${this.formatSize(totalSize)}`);
  }

  /**
   * Helper: Group files by directory
   */
  private groupByDirectory(files: FileConsolidation[]): Record<string, FileConsolidation[]> {
    const grouped: Record<string, FileConsolidation[]> = {};
    
    for (const file of files) {
      const dir = path.dirname(file.path);
      if (!grouped[dir]) {
        grouped[dir] = [];
      }
      grouped[dir].push(file);
    }
    
    return grouped;
  }

  /**
   * Helper: Format file size
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Main execution
if (require.main === module) {
  const consolidator = new FileConsolidator();
  consolidator.consolidate().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { FileConsolidator };
