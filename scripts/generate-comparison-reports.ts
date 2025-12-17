#!/usr/bin/env tsx
/**
 * Comparison Reports Script
 * 
 * Generates detailed comparison reports between:
 * 1. uncommitted-files vs main
 * 2. uncommitted-files vs v0.0.9
 * 3. main vs v0.0.9
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileComparison {
  onlyInFirst: string[];
  onlyInSecond: string[];
  inBoth: string[];
  totalFirst: number;
  totalSecond: number;
}

const MAIN_BRANCH = 'main';
const V009_BRANCH = 'ZacAi-Hybrid-LLM-v0.0.9';
const UNCOMMITTED_BRANCH = 'uncommitted-files';

class ComparisonReporter {
  private manifest: any;
  private consolidationPlan: any;

  constructor() {}

  /**
   * Main entry point
   */
  async generateReports(): Promise<void> {
    console.log('📊 Generating Comparison Reports...\n');

    try {
      // Load data
      await this.loadData();

      // Generate reports
      await this.generateUncommittedVsMainReport();
      await this.generateUncommittedVsV009Report();
      await this.generateMainVsV009Report();

      console.log('✅ All comparison reports generated!\n');

    } catch (error) {
      console.error('❌ Error generating reports:', error);
      throw error;
    }
  }

  /**
   * Load required data files
   */
  private async loadData(): Promise<void> {
    console.log('📂 Loading data files...');

    if (!fs.existsSync('branch-analysis-manifest.json')) {
      throw new Error('branch-analysis-manifest.json not found. Run analyze-branches.ts first.');
    }

    this.manifest = JSON.parse(fs.readFileSync('branch-analysis-manifest.json', 'utf-8'));

    if (fs.existsSync('consolidation-plan.json')) {
      this.consolidationPlan = JSON.parse(fs.readFileSync('consolidation-plan.json', 'utf-8'));
      console.log('✅ Loaded consolidation plan\n');
    } else {
      console.log('⚠️  No consolidation plan found, will use analysis data only\n');
    }
  }

  /**
   * Generate uncommitted-files vs main comparison
   */
  private async generateUncommittedVsMainReport(): Promise<void> {
    console.log('📝 Generating uncommitted-files vs main comparison...');

    let content = `# Comparison: uncommitted-files vs main\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Overview\n\n`;
    content += `This report shows what functionality would be added to \`main\` if the \`${UNCOMMITTED_BRANCH}\` branch were merged.\n\n`;

    if (this.consolidationPlan) {
      const files = this.consolidationPlan.files || [];
      
      content += `### Summary\n\n`;
      content += `- **Files in uncommitted-files**: ${files.length} (unique files not in main)\n`;
      content += `- **Conflicts requiring review**: ${this.consolidationPlan.conflicts || 0}\n\n`;

      // Group by category
      const byCategory = this.categorizeFiles(files.map((f: any) => f.path));

      content += `### Files by Category\n\n`;
      for (const [category, categoryFiles] of Object.entries(byCategory)) {
        content += `#### ${category} (${(categoryFiles as string[]).length} files)\n\n`;
        
        const byDir = this.groupByDirectory(categoryFiles as string[]);
        for (const [dir, dirFiles] of Object.entries(byDir)) {
          if (dirFiles.length > 0) {
            content += `**\`${dir}/\`**\n`;
            for (const file of dirFiles.slice(0, 5)) {
              content += `- \`${file}\`\n`;
            }
            if (dirFiles.length > 5) {
              content += `- ... and ${dirFiles.length - 5} more files\n`;
            }
            content += `\n`;
          }
        }
      }

      // Impact analysis
      content += `## Impact Analysis\n\n`;
      content += `### What Would Be Gained\n\n`;
      content += this.analyzeImpact(files.map((f: any) => f.path));

    } else {
      content += `⚠️ Consolidation plan not yet generated. Run consolidate-files.ts first.\n\n`;
      content += `This report will show the differences once files are consolidated.\n`;
    }

    fs.writeFileSync('COMPARISON_UNCOMMITTED_VS_MAIN.md', content);
    console.log('✅ Generated COMPARISON_UNCOMMITTED_VS_MAIN.md');
  }

  /**
   * Generate uncommitted-files vs v0.0.9 comparison
   */
  private async generateUncommittedVsV009Report(): Promise<void> {
    console.log('📝 Generating uncommitted-files vs v0.0.9 comparison...');

    let content = `# Comparison: uncommitted-files vs v0.0.9\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Overview\n\n`;
    content += `This report shows what \`${V009_BRANCH}\` is missing compared to the consolidated \`${UNCOMMITTED_BRANCH}\` branch.\n\n`;

    // Get v0.0.9 files from manifest
    const v009Branch = this.manifest.branches.find((b: any) => b.name === V009_BRANCH);
    
    if (!v009Branch) {
      content += `⚠️ v0.0.9 branch data not found in manifest.\n`;
    } else if (this.consolidationPlan) {
      const uncommittedFiles = new Set(this.consolidationPlan.files.map((f: any) => f.path));
      const v009Files = new Set<string>();
      
      // We need to get v0.0.9 file list - it wasn't stored as 'files' in manifest
      // For now, we'll note this needs the full branch file list
      
      content += `### Summary\n\n`;
      content += `- **Files in uncommitted-files**: ${uncommittedFiles.size}\n`;
      content += `- **Files in v0.0.9**: ${v009Branch.totalFiles}\n\n`;
      
      content += `### What v0.0.9 is Missing\n\n`;
      content += `The uncommitted-files branch contains ${uncommittedFiles.size} files that are not in main.\n`;
      content += `A detailed comparison requires fetching the complete file list from v0.0.9.\n\n`;

      // Categorize what's missing
      const byCategory = this.categorizeFiles(Array.from(uncommittedFiles));
      
      content += `### Missing Files by Category\n\n`;
      for (const [category, categoryFiles] of Object.entries(byCategory)) {
        content += `#### ${category} (${(categoryFiles as string[]).length} files)\n\n`;
        for (const file of (categoryFiles as string[]).slice(0, 10)) {
          content += `- \`${file}\`\n`;
        }
        if ((categoryFiles as string[]).length > 10) {
          content += `- ... and ${(categoryFiles as string[]).length - 10} more files\n`;
        }
        content += `\n`;
      }

    } else {
      content += `⚠️ Consolidation plan not yet generated. Run consolidate-files.ts first.\n`;
    }

    fs.writeFileSync('COMPARISON_UNCOMMITTED_VS_V009.md', content);
    console.log('✅ Generated COMPARISON_UNCOMMITTED_VS_V009.md');
  }

  /**
   * Generate main vs v0.0.9 comparison
   */
  private async generateMainVsV009Report(): Promise<void> {
    console.log('📝 Generating main vs v0.0.9 comparison...');

    let content = `# Comparison: main vs v0.0.9\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Overview\n\n`;
    content += `This report compares the current \`${MAIN_BRANCH}\` branch with \`${V009_BRANCH}\`.\n\n`;

    const mainBranch = this.manifest.branches.find((b: any) => b.name === MAIN_BRANCH);
    const v009Branch = this.manifest.branches.find((b: any) => b.name === V009_BRANCH);

    if (!mainBranch || !v009Branch) {
      content += `⚠️ Required branch data not found in manifest.\n`;
    } else {
      content += `### Summary\n\n`;
      content += `- **Files in main**: ${mainBranch.totalFiles}\n`;
      content += `- **Files in v0.0.9**: ${v009Branch.totalFiles}\n`;
      content += `- **Files in main but not v0.0.9**: ${mainBranch.uniqueFiles}\n`;
      content += `- **Files in v0.0.9 but not main**: ${v009Branch.uniqueFiles}\n\n`;

      content += `### Files in main but not in v0.0.9\n\n`;
      if (mainBranch.files && mainBranch.files.length > 0) {
        const byCategory = this.categorizeFiles(mainBranch.files.map((f: any) => f.path));
        
        for (const [category, categoryFiles] of Object.entries(byCategory)) {
          content += `#### ${category} (${(categoryFiles as string[]).length} files)\n\n`;
          for (const file of (categoryFiles as string[]).slice(0, 10)) {
            content += `- \`${file}\`\n`;
          }
          if ((categoryFiles as string[]).length > 10) {
            content += `- ... and ${(categoryFiles as string[]).length - 10} more files\n`;
          }
          content += `\n`;
        }
      } else {
        content += `No unique files in main.\n\n`;
      }

      content += `### Recommendations\n\n`;
      if (mainBranch.uniqueFiles > 0) {
        content += `Main has ${mainBranch.uniqueFiles} files that are not in v0.0.9. `;
        content += `These should be reviewed to determine if they should be merged into v0.0.9.\n\n`;
      } else {
        content += `Main and v0.0.9 have similar file structures. `;
        content += `The main differences may be in file contents rather than file presence.\n\n`;
      }
    }

    fs.writeFileSync('COMPARISON_MAIN_VS_V009.md', content);
    console.log('✅ Generated COMPARISON_MAIN_VS_V009.md');
  }

  /**
   * Categorize files by type
   */
  private categorizeFiles(files: string[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      'AI/ML Components': [],
      'UI Components': [],
      'API/Backend': [],
      'Configuration': [],
      'Documentation': [],
      'Tests': [],
      'Scripts': [],
      'Other': [],
    };

    for (const file of files) {
      if (file.includes('/ai/') || file.includes('model') || file.includes('llm')) {
        categories['AI/ML Components'].push(file);
      } else if (file.includes('/components/') || file.includes('/ui/')) {
        categories['UI Components'].push(file);
      } else if (file.includes('/api/') || file.includes('server') || file.includes('backend')) {
        categories['API/Backend'].push(file);
      } else if (file.endsWith('.json') || file.endsWith('.config.') || file.includes('config')) {
        categories['Configuration'].push(file);
      } else if (file.endsWith('.md') || file.includes('doc')) {
        categories['Documentation'].push(file);
      } else if (file.includes('test') || file.includes('__tests__')) {
        categories['Tests'].push(file);
      } else if (file.includes('/scripts/')) {
        categories['Scripts'].push(file);
      } else {
        categories['Other'].push(file);
      }
    }

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, files]) => files.length > 0)
    );
  }

  /**
   * Group files by directory
   */
  private groupByDirectory(files: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    
    for (const file of files) {
      const dir = path.dirname(file);
      if (!grouped[dir]) {
        grouped[dir] = [];
      }
      grouped[dir].push(path.basename(file));
    }
    
    return grouped;
  }

  /**
   * Analyze impact of files
   */
  private analyzeImpact(files: string[]): string {
    let impact = '';
    
    const categories = this.categorizeFiles(files);
    
    for (const [category, categoryFiles] of Object.entries(categories)) {
      impact += `**${category}**: ${categoryFiles.length} files\n`;
      
      if (category === 'AI/ML Components') {
        impact += `- These files likely contain important AI model implementations and logic\n`;
      } else if (category === 'UI Components') {
        impact += `- These files contain user interface components and pages\n`;
      } else if (category === 'API/Backend') {
        impact += `- These files contain backend logic and API endpoints\n`;
      }
      
      impact += `\n`;
    }
    
    return impact;
  }
}

// Main execution
if (require.main === module) {
  const reporter = new ComparisonReporter();
  reporter.generateReports().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ComparisonReporter };
