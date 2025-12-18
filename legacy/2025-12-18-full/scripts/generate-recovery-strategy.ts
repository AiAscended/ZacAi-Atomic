#!/usr/bin/env tsx
/**
 * Recovery Strategy Generator
 * 
 * Generates RECOVERY_STRATEGY.md with:
 * 1. Priority order for merging files
 * 2. Recommended PR sequence
 * 3. Strategy for handling stuck PRs #33, #34, #37
 */

import * as fs from 'fs';
import * as path from 'path';

class RecoveryStrategyGenerator {
  private manifest: any;
  private consolidationPlan: any;

  constructor() {}

  /**
   * Main entry point
   */
  async generate(): Promise<void> {
    console.log('📋 Generating Recovery Strategy...\n');

    try {
      // Load data
      await this.loadData();

      // Generate strategy document
      await this.generateStrategyDocument();

      console.log('✅ Recovery strategy generated!\n');

    } catch (error) {
      console.error('❌ Error generating strategy:', error);
      throw error;
    }
  }

  /**
   * Load required data files
   */
  private async loadData(): Promise<void> {
    console.log('📂 Loading data files...');

    if (fs.existsSync('branch-analysis-manifest.json')) {
      this.manifest = JSON.parse(fs.readFileSync('branch-analysis-manifest.json', 'utf-8'));
    }

    if (fs.existsSync('consolidation-plan.json')) {
      this.consolidationPlan = JSON.parse(fs.readFileSync('consolidation-plan.json', 'utf-8'));
    }

    console.log('✅ Data loaded\n');
  }

  /**
   * Generate the recovery strategy document
   */
  private async generateStrategyDocument(): Promise<void> {
    console.log('📝 Writing RECOVERY_STRATEGY.md...');

    let content = `# Recovery Strategy for ZacAi-Atomic\n\n`;
    content += `Generated: ${new Date().toISOString()}\n\n`;
    content += `## Executive Summary\n\n`;
    content += `This document outlines a comprehensive strategy for recovering and consolidating work from 56+ branches in the ZacAi-Atomic repository. `;
    content += `Many branches contain files that were never merged to \`main\`, resulting in lost functionality and a fragmented codebase.\n\n`;

    content += `### Current Situation\n\n`;
    if (this.manifest) {
      content += `- **Total Branches**: ${this.manifest.branches.length}\n`;
      content += `- **Files in Main**: ${this.manifest.branches.find((b: any) => b.name === 'main')?.totalFiles || 'N/A'}\n`;
      content += `- **Files in v0.0.9**: ${this.manifest.branches.find((b: any) => b.name === 'ZacAi-Hybrid-LLM-v0.0.9')?.totalFiles || 'N/A'}\n`;
    }
    if (this.consolidationPlan) {
      content += `- **Unique Files to Recover**: ${this.consolidationPlan.totalFiles || 0}\n`;
      content += `- **Conflicts to Resolve**: ${this.consolidationPlan.conflicts || 0}\n`;
    }
    content += `\n`;

    // Phase 1: Immediate Actions
    content += `## Phase 1: Immediate Actions ⚡\n\n`;
    content += `### 1.1 Complete Analysis\n\n`;
    content += `- [x] Run \`tsx scripts/analyze-branches.ts\` to analyze all branches\n`;
    content += `- [x] Run \`tsx scripts/consolidate-files.ts\` to plan file consolidation\n`;
    content += `- [x] Run \`tsx scripts/generate-comparison-reports.ts\` to generate comparisons\n`;
    content += `- [ ] Review all generated reports for accuracy\n\n`;

    content += `### 1.2 Create Consolidation Branch\n\n`;
    content += `- [ ] Create \`uncommitted-files\` branch from \`main\`\n`;
    content += `- [ ] Use the consolidation plan to copy files from source branches\n`;
    content += `- [ ] Commit with detailed metadata about source branches\n`;
    content += `- [ ] Push to GitHub for review\n\n`;

    // Phase 2: Priority File Recovery
    content += `## Phase 2: Priority File Recovery 🎯\n\n`;
    content += `### 2.1 Critical Infrastructure Files\n\n`;
    content += `**Priority: HIGHEST**\n\n`;
    content += `Files that affect build system, core AI functionality, and application structure:\n\n`;
    content += this.generatePriorityList('infrastructure');

    content += `### 2.2 AI/ML Components\n\n`;
    content += `**Priority: HIGH**\n\n`;
    content += `AI models, orchestration, and domain logic:\n\n`;
    content += this.generatePriorityList('ai');

    content += `### 2.3 UI/UX Enhancements\n\n`;
    content += `**Priority: MEDIUM**\n\n`;
    content += `User interface components and pages:\n\n`;
    content += this.generatePriorityList('ui');

    content += `### 2.4 Documentation and Tests\n\n`;
    content += `**Priority: MEDIUM-LOW**\n\n`;
    content += `Documentation, test files, and supporting materials:\n\n`;
    content += this.generatePriorityList('docs');

    // Phase 3: Conflict Resolution
    content += `## Phase 3: Conflict Resolution ⚠️\n\n`;
    if (this.consolidationPlan?.conflictDetails) {
      content += `There are ${this.consolidationPlan.conflictDetails.length} files with conflicts that need manual review:\n\n`;
      
      for (const conflict of this.consolidationPlan.conflictDetails.slice(0, 10)) {
        content += `### \`${conflict.path}\`\n\n`;
        content += `**Conflict**: Found in ${conflict.branches.length} branches with different versions\n\n`;
        content += `**Resolution Strategy**:\n`;
        content += `1. Compare versions from each branch\n`;
        content += `2. Identify which has the most complete/recent implementation\n`;
        content += `3. Manually merge important differences\n`;
        content += `4. Test the merged version\n\n`;
        content += `**Branches**:\n`;
        for (const branch of conflict.branches) {
          content += `- ${branch.branch} (SHA: \`${branch.sha.substring(0, 7)}\`, Size: ${branch.size} bytes)\n`;
        }
        content += `\n`;
      }

      if (this.consolidationPlan.conflictDetails.length > 10) {
        content += `... and ${this.consolidationPlan.conflictDetails.length - 10} more conflicts. `;
        content += `See \`CONSOLIDATION_REPORT.md\` for complete list.\n\n`;
      }
    } else {
      content += `Run the consolidation script to identify specific conflicts.\n\n`;
    }

    // Phase 4: PR Strategy
    content += `## Phase 4: Pull Request Strategy 📝\n\n`;
    content += `### 4.1 Recommended PR Sequence\n\n`;
    content += `To minimize conflicts and ensure smooth merging:\n\n`;
    content += `#### PR #1: Critical Infrastructure\n`;
    content += `- Build configuration files\n`;
    content += `- Core type definitions\n`;
    content += `- Essential dependencies\n`;
    content += `- **Target**: \`main\`\n`;
    content += `- **Size**: Small (~10-20 files)\n`;
    content += `- **Risk**: Low\n\n`;

    content += `#### PR #2: AI Core Components\n`;
    content += `- Core AI orchestration files\n`;
    content += `- Base model implementations\n`;
    content += `- System registry updates\n`;
    content += `- **Target**: \`main\`\n`;
    content += `- **Size**: Medium (~50-100 files)\n`;
    content += `- **Risk**: Medium\n`;
    content += `- **Requires**: PR #1 merged\n\n`;

    content += `#### PR #3: Domain-Specific AI\n`;
    content += `- Domain vocabularies\n`;
    content += `- Specialized models\n`;
    content += `- Integration modules\n`;
    content += `- **Target**: \`main\`\n`;
    content += `- **Size**: Large (~100-200 files)\n`;
    content += `- **Risk**: Medium\n`;
    content += `- **Requires**: PR #2 merged\n\n`;

    content += `#### PR #4: UI/UX Updates\n`;
    content += `- New components\n`;
    content += `- Page updates\n`;
    content += `- Styling changes\n`;
    content += `- **Target**: \`main\`\n`;
    content += `- **Size**: Medium (~50-100 files)\n`;
    content += `- **Risk**: Low\n`;
    content += `- **Requires**: PR #1 merged\n\n`;

    content += `#### PR #5: Documentation & Tests\n`;
    content += `- Updated documentation\n`;
    content += `- New test files\n`;
    content += `- README updates\n`;
    content += `- **Target**: \`main\`\n`;
    content += `- **Size**: Small (~20-50 files)\n`;
    content += `- **Risk**: Very Low\n`;
    content += `- **Can be parallel**: With other PRs\n\n`;

    // Stuck PRs
    content += `### 4.2 Handling Stuck PRs (#33, #34, #37)\n\n`;
    content += `#### Strategy for Stuck PRs\n\n`;
    content += `These PRs are likely blocked due to:\n`;
    content += `- Merge conflicts with main\n`;
    content += `- Missing dependencies from other branches\n`;
    content += `- Breaking changes\n\n`;

    content += `**Resolution Approach**:\n\n`;
    content += `1. **Review each stuck PR**:\n`;
    content += `   - Identify the specific changes they introduce\n`;
    content += `   - Check if those changes are already in other branches\n`;
    content += `   - Determine if they're superseded by newer work\n\n`;

    content += `2. **For each PR, choose one**:\n\n`;
    content += `   **Option A: Supersede**\n`;
    content += `   - Close the PR with explanation\n`;
    content += `   - Ensure its changes are included in the consolidation\n`;
    content += `   - Reference the new PR that includes the work\n\n`;

    content += `   **Option B: Rebase and Update**\n`;
    content += `   - Create new branch from current main\n`;
    content += `   - Cherry-pick commits from stuck PR\n`;
    content += `   - Resolve conflicts with current codebase\n`;
    content += `   - Open new PR referencing the old one\n\n`;

    content += `   **Option C: Merge as-is**\n`;
    content += `   - Only if changes are still needed and compatible\n`;
    content += `   - Resolve conflicts manually\n`;
    content += `   - Test thoroughly before merging\n\n`;

    // Phase 5: Testing Strategy
    content += `## Phase 5: Testing & Validation ✅\n\n`;
    content += `### 5.1 Pre-Merge Testing\n\n`;
    content += `For each PR, before merging:\n\n`;
    content += `1. **Build Test**: Ensure project builds successfully\n`;
    content += `   \`\`\`bash\n`;
    content += `   npm run build\n`;
    content += `   \`\`\`\n\n`;

    content += `2. **Lint Check**: Run linting\n`;
    content += `   \`\`\`bash\n`;
    content += `   npm run lint\n`;
    content += `   \`\`\`\n\n`;

    content += `3. **Type Check**: Verify TypeScript types\n`;
    content += `   \`\`\`bash\n`;
    content += `   npx tsc --noEmit\n`;
    content += `   \`\`\`\n\n`;

    content += `4. **Test Suite**: Run existing tests\n`;
    content += `   \`\`\`bash\n`;
    content += `   npm test\n`;
    content += `   \`\`\`\n\n`;

    content += `5. **Manual Testing**: Test affected features\n`;
    content += `   - Start dev server\n`;
    content += `   - Test AI functionality\n`;
    content += `   - Verify UI changes\n\n`;

    // Phase 6: Post-Merge
    content += `## Phase 6: Post-Consolidation 🎉\n\n`;
    content += `### 6.1 After All PRs Merged\n\n`;
    content += `1. **Update v0.0.9**:\n`;
    content += `   - Merge consolidated main into v0.0.9\n`;
    content += `   - Create new release tag (v0.1.0?)\n`;
    content += `   - Update release notes\n\n`;

    content += `2. **Clean Up Branches**:\n`;
    content += `   - Archive successfully merged branches\n`;
    content += `   - Delete obsolete branches\n`;
    content += `   - Keep only active development branches\n\n`;

    content += `3. **Documentation**:\n`;
    content += `   - Update README with new structure\n`;
    content += `   - Document new features added\n`;
    content += `   - Create architecture diagrams\n\n`;

    content += `4. **Set Up Branch Protection**:\n`;
    content += `   - Require PR reviews for main\n`;
    content += `   - Require passing CI/CD checks\n`;
    content += `   - Prevent force pushes\n\n`;

    // Timeline
    content += `## Estimated Timeline ⏱️\n\n`;
    content += `| Phase | Estimated Time | Priority |\n`;
    content += `|-------|---------------|----------|\n`;
    content += `| Analysis Complete | ✅ Done | - |\n`;
    content += `| Create Consolidation Branch | 1-2 hours | HIGH |\n`;
    content += `| PR #1 (Infrastructure) | 1-2 days | HIGH |\n`;
    content += `| PR #2 (AI Core) | 2-3 days | HIGH |\n`;
    content += `| PR #3 (Domain AI) | 3-5 days | MEDIUM |\n`;
    content += `| PR #4 (UI/UX) | 2-3 days | MEDIUM |\n`;
    content += `| PR #5 (Docs/Tests) | 1-2 days | LOW |\n`;
    content += `| Resolve Stuck PRs | 1-2 days | MEDIUM |\n`;
    content += `| Testing & Validation | Ongoing | HIGH |\n`;
    content += `| Total | ~2-3 weeks | - |\n\n`;

    // Risk Mitigation
    content += `## Risk Mitigation 🛡️\n\n`;
    content += `### Potential Risks\n\n`;
    content += `1. **Breaking Changes**: Files from different branches may be incompatible\n`;
    content += `   - **Mitigation**: Test incrementally, isolate changes in separate PRs\n\n`;
    content += `2. **Lost Context**: May not remember why certain files exist\n`;
    content += `   - **Mitigation**: Review commit messages, check branch creation dates\n\n`;
    content += `3. **Duplicate Work**: Same feature implemented differently in multiple branches\n`;
    content += `   - **Mitigation**: Careful review during consolidation, choose best implementation\n\n`;
    content += `4. **Testing Gaps**: Hard to test all functionality\n`;
    content += `   - **Mitigation**: Focus on critical paths, add tests where needed\n\n`;

    // Success Criteria
    content += `## Success Criteria ✨\n\n`;
    content += `The recovery is successful when:\n\n`;
    content += `- [x] ✅ All unique files identified and cataloged\n`;
    content += `- [ ] All high-priority files merged to main\n`;
    content += `- [ ] Build passes on main branch\n`;
    content += `- [ ] No critical functionality missing\n`;
    content += `- [ ] Stuck PRs resolved or superseded\n`;
    content += `- [ ] Main and v0.0.9 in sync\n`;
    content += `- [ ] Documentation updated\n`;
    content += `- [ ] Team can develop on clean main branch\n\n`;

    // Next Steps
    content += `## Immediate Next Steps 🚀\n\n`;
    content += `1. Review this strategy document with the team\n`;
    content += `2. Review all generated analysis reports:\n`;
    content += `   - \`BRANCH_ANALYSIS.md\`\n`;
    content += `   - \`MISSING_FROM_MAIN.md\`\n`;
    content += `   - \`MISSING_FROM_V009.md\`\n`;
    content += `   - \`CONSOLIDATION_REPORT.md\`\n`;
    content += `3. Create the \`uncommitted-files\` branch\n`;
    content += `4. Begin with PR #1 (Critical Infrastructure)\n`;
    content += `5. Set up CI/CD to run on all new PRs\n\n`;

    content += `---\n\n`;
    content += `**Note**: This is a living document. Update it as the recovery progresses.\n`;

    fs.writeFileSync('RECOVERY_STRATEGY.md', content);
    console.log('✅ Generated RECOVERY_STRATEGY.md');
  }

  /**
   * Generate priority list for a category
   */
  private generatePriorityList(category: string): string {
    let list = '';

    if (!this.consolidationPlan?.files) {
      list += `Run consolidation script to see specific files.\n\n`;
      return list;
    }

    const files = this.consolidationPlan.files || [];
    let categoryFiles: any[] = [];

    switch (category) {
      case 'infrastructure':
        categoryFiles = files.filter((f: any) => 
          f.path.includes('config') || 
          f.path.includes('.json') ||
          f.path.endsWith('tsconfig.json') ||
          f.path.includes('eslint') ||
          f.path.includes('package.json')
        );
        break;
      case 'ai':
        categoryFiles = files.filter((f: any) => 
          f.path.includes('/ai/') && !f.path.includes('test')
        );
        break;
      case 'ui':
        categoryFiles = files.filter((f: any) => 
          f.path.includes('/components/') || 
          f.path.includes('/ui/') ||
          f.path.includes('/app/')
        );
        break;
      case 'docs':
        categoryFiles = files.filter((f: any) => 
          f.path.endsWith('.md') || 
          f.path.includes('test') ||
          f.path.includes('__tests__')
        );
        break;
    }

    if (categoryFiles.length === 0) {
      list += `No files identified in this category yet.\n\n`;
    } else {
      list += `**Count**: ${categoryFiles.length} files\n\n`;
      list += `**Top Files**:\n`;
      for (const file of categoryFiles.slice(0, 10)) {
        list += `- \`${file.path}\` (from ${file.sourceBranch})\n`;
      }
      if (categoryFiles.length > 10) {
        list += `- ... and ${categoryFiles.length - 10} more files\n`;
      }
      list += `\n`;
    }

    return list;
  }
}

// Main execution
if (require.main === module) {
  const generator = new RecoveryStrategyGenerator();
  generator.generate().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { RecoveryStrategyGenerator };
