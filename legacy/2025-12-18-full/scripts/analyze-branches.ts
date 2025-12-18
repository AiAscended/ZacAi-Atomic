#!/usr/bin/env tsx
/**
 * Branch Analysis Script
 * 
 * Analyzes all 56 branches in the repository to:
 * 1. Fetch file lists from all branches using GitHub API
 * 2. Compare each branch against main to identify unique files
 * 3. Compare main against ZacAi-Hybrid-LLM-v0.0.9
 * 4. Generate detailed reports in markdown format
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

interface BranchInfo {
  name: string;
  sha: string;
  protected: boolean;
}

interface FileInfo {
  path: string;
  sha: string;
  size: number;
  branch: string;
  url: string;
}

interface BranchAnalysis {
  branch: string;
  sha: string;
  totalFiles: number;
  uniqueFiles: FileInfo[];
  filesNotInMain: FileInfo[];
  filesNotInV009: FileInfo[];
}

const OWNER = 'AiAscended';
const REPO = 'ZacAi-Atomic';
const MAIN_BRANCH = 'main';
const V009_BRANCH = 'ZacAi-Hybrid-LLM-v0.0.9';

// GitHub token from environment (optional, increases rate limit)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

class BranchAnalyzer {
  private octokit: Octokit;
  private branches: BranchInfo[] = [];
  private branchFiles: Map<string, FileInfo[]> = new Map();
  private mainFiles: Set<string> = new Set();
  private v009Files: Set<string> = new Set();

  constructor() {
    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
      request: {
        timeout: 30000,
      },
    });
  }

  /**
   * Main entry point for analysis
   */
  async analyze(): Promise<void> {
    console.log('🔍 Starting Branch Analysis...\n');

    try {
      // Step 1: Fetch all branches
      await this.fetchAllBranches();
      console.log(`✅ Found ${this.branches.length} branches\n`);

      // Step 2: Fetch files from main and v0.0.9 first
      console.log('📁 Fetching files from main branch...');
      await this.fetchBranchFiles(MAIN_BRANCH);
      this.mainFiles = new Set(
        (this.branchFiles.get(MAIN_BRANCH) || []).map(f => f.path)
      );
      console.log(`✅ Main has ${this.mainFiles.size} files\n`);

      console.log('📁 Fetching files from v0.0.9 branch...');
      await this.fetchBranchFiles(V009_BRANCH);
      this.v009Files = new Set(
        (this.branchFiles.get(V009_BRANCH) || []).map(f => f.path)
      );
      console.log(`✅ v0.0.9 has ${this.v009Files.size} files\n`);

      // Step 3: Fetch files from all other branches
      const otherBranches = this.branches.filter(
        b => b.name !== MAIN_BRANCH && b.name !== V009_BRANCH
      );

      console.log(`📁 Fetching files from ${otherBranches.length} other branches...\n`);
      for (let i = 0; i < otherBranches.length; i++) {
        const branch = otherBranches[i];
        console.log(`[${i + 1}/${otherBranches.length}] Analyzing ${branch.name}...`);
        
        try {
          await this.fetchBranchFiles(branch.name);
          await this.delay(500); // Rate limiting
        } catch (error) {
          console.error(`   ❌ Error fetching ${branch.name}: ${error}`);
        }
      }

      // Step 4: Analyze differences
      console.log('\n📊 Analyzing differences...\n');
      const analyses = this.analyzeAllBranches();

      // Step 5: Generate reports
      console.log('📝 Generating reports...\n');
      await this.generateReports(analyses);

      console.log('✅ Analysis complete!\n');
      this.printSummary(analyses);

    } catch (error) {
      console.error('❌ Error during analysis:', error);
      throw error;
    }
  }

  /**
   * Fetch all branches from the repository
   */
  private async fetchAllBranches(): Promise<void> {
    const allBranches: BranchInfo[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.octokit.repos.listBranches({
        owner: OWNER,
        repo: REPO,
        per_page: 100,
        page,
      });

      allBranches.push(...response.data.map(b => ({
        name: b.name,
        sha: b.commit.sha,
        protected: b.protected,
      })));

      hasMore = response.data.length === 100;
      page++;
    }

    this.branches = allBranches;
  }

  /**
   * Fetch all files from a specific branch
   */
  private async fetchBranchFiles(branchName: string): Promise<void> {
    try {
      const branch = this.branches.find(b => b.name === branchName);
      if (!branch) {
        console.warn(`Branch ${branchName} not found`);
        return;
      }

      const tree = await this.octokit.git.getTree({
        owner: OWNER,
        repo: REPO,
        tree_sha: branch.sha,
        recursive: 'true',
      });

      const files: FileInfo[] = tree.data.tree
        .filter(item => item.type === 'blob')
        .map(item => ({
          path: item.path!,
          sha: item.sha!,
          size: item.size || 0,
          branch: branchName,
          url: item.url || '',
        }));

      this.branchFiles.set(branchName, files);
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`   ⚠️  Branch ${branchName} tree not found`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Analyze all branches and compare against main and v0.0.9
   */
  private analyzeAllBranches(): BranchAnalysis[] {
    const analyses: BranchAnalysis[] = [];

    for (const branch of this.branches) {
      const branchFilesList = this.branchFiles.get(branch.name) || [];
      const branchFileSet = new Set(branchFilesList.map(f => f.path));

      // Find files not in main
      const filesNotInMain = branchFilesList.filter(
        f => !this.mainFiles.has(f.path)
      );

      // Find files not in v0.0.9
      const filesNotInV009 = branchFilesList.filter(
        f => !this.v009Files.has(f.path)
      );

      analyses.push({
        branch: branch.name,
        sha: branch.sha,
        totalFiles: branchFilesList.length,
        uniqueFiles: filesNotInMain,
        filesNotInMain,
        filesNotInV009,
      });
    }

    return analyses;
  }

  /**
   * Generate all markdown reports
   */
  private async generateReports(analyses: BranchAnalysis[]): Promise<void> {
    // Generate BRANCH_ANALYSIS.md
    await this.generateBranchAnalysisReport(analyses);

    // Generate MISSING_FROM_MAIN.md
    await this.generateMissingFromMainReport(analyses);

    // Generate MISSING_FROM_V009.md
    await this.generateMissingFromV009Report(analyses);

    // Generate JSON manifest for automation
    await this.generateJSONManifest(analyses);
  }

  /**
   * Generate BRANCH_ANALYSIS.md - Files unique to each branch
   */
  private async generateBranchAnalysisReport(analyses: BranchAnalysis[]): Promise<void> {
    let content = `# Branch Analysis Report\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Overview\n\n`;
    content += `Total Branches Analyzed: ${this.branches.length}\n\n`;
    content += `### Summary\n\n`;
    content += `| Branch | Total Files | Unique Files (not in main) |\n`;
    content += `|--------|-------------|----------------------------|\n`;

    for (const analysis of analyses) {
      content += `| ${analysis.branch} | ${analysis.totalFiles} | ${analysis.filesNotInMain.length} |\n`;
    }

    content += `\n## Detailed Analysis\n\n`;

    for (const analysis of analyses) {
      if (analysis.filesNotInMain.length === 0) {
        continue;
      }

      content += `### ${analysis.branch}\n\n`;
      content += `- **SHA**: \`${analysis.sha.substring(0, 7)}\`\n`;
      content += `- **Total Files**: ${analysis.totalFiles}\n`;
      content += `- **Files Not in Main**: ${analysis.filesNotInMain.length}\n\n`;

      if (analysis.filesNotInMain.length > 0) {
        content += `#### Unique Files:\n\n`;
        
        // Group by directory
        const byDirectory = this.groupFilesByDirectory(analysis.filesNotInMain);
        
        for (const [dir, files] of Object.entries(byDirectory)) {
          content += `**${dir}**\n`;
          for (const file of files) {
            content += `- \`${file.path}\` (${this.formatSize(file.size)})\n`;
          }
          content += `\n`;
        }
      }
    }

    fs.writeFileSync('BRANCH_ANALYSIS.md', content);
    console.log('✅ Generated BRANCH_ANALYSIS.md');
  }

  /**
   * Generate MISSING_FROM_MAIN.md - Files in other branches but not in main
   */
  private async generateMissingFromMainReport(analyses: BranchAnalysis[]): Promise<void> {
    let content = `# Files Missing from Main Branch\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Overview\n\n`;
    content += `This report identifies files that exist in other branches but are missing from the \`main\` branch.\n\n`;

    // Collect all unique files missing from main
    const missingFiles = new Map<string, Set<string>>();

    for (const analysis of analyses) {
      if (analysis.branch === MAIN_BRANCH) continue;

      for (const file of analysis.filesNotInMain) {
        if (!missingFiles.has(file.path)) {
          missingFiles.set(file.path, new Set());
        }
        missingFiles.get(file.path)!.add(analysis.branch);
      }
    }

    content += `### Summary\n\n`;
    content += `- **Total Unique Files Missing**: ${missingFiles.size}\n`;
    content += `- **Files in Multiple Branches**: ${Array.from(missingFiles.values()).filter(s => s.size > 1).length}\n\n`;

    // Group by directory
    const byDirectory = new Map<string, Array<[string, Set<string>]>>();
    
    for (const [filePath, branches] of missingFiles.entries()) {
      const dir = path.dirname(filePath);
      if (!byDirectory.has(dir)) {
        byDirectory.set(dir, []);
      }
      byDirectory.get(dir)!.push([filePath, branches]);
    }

    content += `## Files by Directory\n\n`;

    for (const [dir, files] of Array.from(byDirectory.entries()).sort()) {
      content += `### \`${dir}/\`\n\n`;
      
      for (const [filePath, branches] of files.sort((a, b) => a[0].localeCompare(b[0]))) {
        const branchList = Array.from(branches).sort().join(', ');
        content += `- **\`${path.basename(filePath)}\`**\n`;
        content += `  - Found in: ${branchList}\n`;
        content += `  - Appears in ${branches.size} branch(es)\n\n`;
      }
    }

    fs.writeFileSync('MISSING_FROM_MAIN.md', content);
    console.log('✅ Generated MISSING_FROM_MAIN.md');
  }

  /**
   * Generate MISSING_FROM_V009.md - Files in other branches/main but not in v0.0.9
   */
  private async generateMissingFromV009Report(analyses: BranchAnalysis[]): Promise<void> {
    let content = `# Files Missing from v0.0.9 Branch\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Overview\n\n`;
    content += `This report identifies files that exist in other branches (including main) but are missing from \`ZacAi-Hybrid-LLM-v0.0.9\`.\n\n`;

    // Collect all unique files missing from v0.0.9
    const missingFiles = new Map<string, Set<string>>();

    for (const analysis of analyses) {
      if (analysis.branch === V009_BRANCH) continue;

      for (const file of analysis.filesNotInV009) {
        if (!missingFiles.has(file.path)) {
          missingFiles.set(file.path, new Set());
        }
        missingFiles.get(file.path)!.add(analysis.branch);
      }
    }

    content += `### Summary\n\n`;
    content += `- **Total Unique Files Missing**: ${missingFiles.size}\n`;
    content += `- **Files Also in Main**: ${Array.from(missingFiles.keys()).filter(f => this.mainFiles.has(f)).length}\n`;
    content += `- **Files in Multiple Branches**: ${Array.from(missingFiles.values()).filter(s => s.size > 1).length}\n\n`;

    // Separate files that are in main vs. not in main
    const inMain: Array<[string, Set<string>]> = [];
    const notInMain: Array<[string, Set<string>]> = [];

    for (const [filePath, branches] of missingFiles.entries()) {
      if (this.mainFiles.has(filePath)) {
        inMain.push([filePath, branches]);
      } else {
        notInMain.push([filePath, branches]);
      }
    }

    content += `## Files in Main but Missing from v0.0.9\n\n`;
    content += `These ${inMain.length} files exist in the main branch but not in v0.0.9:\n\n`;

    const mainByDir = this.groupFilesArrayByDirectory(inMain);
    for (const [dir, files] of Object.entries(mainByDir)) {
      content += `### \`${dir}/\`\n\n`;
      for (const [filePath, branches] of files) {
        content += `- \`${path.basename(filePath)}\`\n`;
      }
      content += `\n`;
    }

    content += `## Files in Other Branches but Not in Main or v0.0.9\n\n`;
    content += `These ${notInMain.length} files exist in other branches but not in main or v0.0.9:\n\n`;

    const notInMainByDir = this.groupFilesArrayByDirectory(notInMain);
    for (const [dir, files] of Object.entries(notInMainByDir)) {
      content += `### \`${dir}/\`\n\n`;
      for (const [filePath, branches] of files) {
        const branchList = Array.from(branches).sort().join(', ');
        content += `- **\`${path.basename(filePath)}\`**\n`;
        content += `  - Found in: ${branchList}\n\n`;
      }
    }

    fs.writeFileSync('MISSING_FROM_V009.md', content);
    console.log('✅ Generated MISSING_FROM_V009.md');
  }

  /**
   * Generate JSON manifest for automation
   */
  private async generateJSONManifest(analyses: BranchAnalysis[]): Promise<void> {
    const manifest = {
      generated: new Date().toISOString(),
      repository: `${OWNER}/${REPO}`,
      totalBranches: this.branches.length,
      mainBranch: MAIN_BRANCH,
      v009Branch: V009_BRANCH,
      branches: analyses.map(a => ({
        name: a.branch,
        sha: a.sha,
        totalFiles: a.totalFiles,
        uniqueFiles: a.filesNotInMain.length,
        missingFromV009: a.filesNotInV009.length,
        files: a.filesNotInMain.map(f => ({
          path: f.path,
          sha: f.sha,
          size: f.size,
        })),
      })),
    };

    fs.writeFileSync(
      'branch-analysis-manifest.json',
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Generated branch-analysis-manifest.json');
  }

  /**
   * Print summary to console
   */
  private printSummary(analyses: BranchAnalysis[]): void {
    console.log('📊 Summary:\n');
    console.log(`Total Branches: ${this.branches.length}`);
    console.log(`Main Branch Files: ${this.mainFiles.size}`);
    console.log(`v0.0.9 Branch Files: ${this.v009Files.size}`);
    
    const totalUnique = analyses.reduce((sum, a) => sum + a.filesNotInMain.length, 0);
    console.log(`\nTotal Unique Files (not in main): ${totalUnique}`);
    
    const branchesWithUnique = analyses.filter(a => a.filesNotInMain.length > 0).length;
    console.log(`Branches with Unique Files: ${branchesWithUnique}`);

    // Find files that appear in multiple branches
    const fileOccurrences = new Map<string, number>();
    for (const analysis of analyses) {
      for (const file of analysis.filesNotInMain) {
        fileOccurrences.set(file.path, (fileOccurrences.get(file.path) || 0) + 1);
      }
    }
    
    const duplicates = Array.from(fileOccurrences.entries()).filter(([_, count]) => count > 1);
    console.log(`Files in Multiple Branches: ${duplicates.length}`);
  }

  /**
   * Helper: Group files by directory
   */
  private groupFilesByDirectory(files: FileInfo[]): Record<string, FileInfo[]> {
    const grouped: Record<string, FileInfo[]> = {};
    
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
   * Helper: Group file tuples by directory
   */
  private groupFilesArrayByDirectory(files: Array<[string, Set<string>]>): Record<string, Array<[string, Set<string>]>> {
    const grouped: Record<string, Array<[string, Set<string>]>> = {};
    
    for (const [filePath, branches] of files) {
      const dir = path.dirname(filePath);
      if (!grouped[dir]) {
        grouped[dir] = [];
      }
      grouped[dir].push([filePath, branches]);
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

  /**
   * Helper: Delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new BranchAnalyzer();
  analyzer.analyze().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { BranchAnalyzer };
