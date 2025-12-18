#!/usr/bin/env tsx
/**
 * Master Recovery Script
 * 
 * Orchestrates all phases of the branch recovery process:
 * 1. Branch analysis
 * 2. File consolidation planning
 * 3. Comparison report generation
 * 4. Recovery strategy documentation
 */

import { BranchAnalyzer } from './analyze-branches';
import { FileConsolidator } from './consolidate-files';
import { ComparisonReporter } from './generate-comparison-reports';
import { RecoveryStrategyGenerator } from './generate-recovery-strategy';

class MasterRecovery {
  async run(): Promise<void> {
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('  🚀 ZacAi-Atomic Branch Recovery System\n');
    console.log('═══════════════════════════════════════════════════════════\n\n');

    try {
      // Phase 1: Analyze all branches
      console.log('▶ PHASE 1: Branch Analysis\n');
      const analyzer = new BranchAnalyzer();
      await analyzer.analyze();
      console.log('\n');

      // Phase 2: Plan file consolidation
      console.log('▶ PHASE 2: File Consolidation Planning\n');
      const consolidator = new FileConsolidator();
      await consolidator.consolidate();
      console.log('\n');

      // Phase 3: Generate comparison reports
      console.log('▶ PHASE 3: Comparison Reports\n');
      const reporter = new ComparisonReporter();
      await reporter.generateReports();
      console.log('\n');

      // Phase 4: Generate recovery strategy
      console.log('▶ PHASE 4: Recovery Strategy\n');
      const strategy = new RecoveryStrategyGenerator();
      await strategy.generate();
      console.log('\n');

      // Summary
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('  ✅ Recovery System Complete!\n');
      console.log('═══════════════════════════════════════════════════════════\n\n');
      
      console.log('📄 Generated Files:\n');
      console.log('  Analysis Reports:');
      console.log('    - BRANCH_ANALYSIS.md');
      console.log('    - MISSING_FROM_MAIN.md');
      console.log('    - MISSING_FROM_V009.md');
      console.log('    - branch-analysis-manifest.json\n');
      
      console.log('  Consolidation Plans:');
      console.log('    - CONSOLIDATION_REPORT.md');
      console.log('    - consolidation-plan.json');
      console.log('    - scripts/consolidate.sh\n');
      
      console.log('  Comparison Reports:');
      console.log('    - COMPARISON_UNCOMMITTED_VS_MAIN.md');
      console.log('    - COMPARISON_UNCOMMITTED_VS_V009.md');
      console.log('    - COMPARISON_MAIN_VS_V009.md\n');
      
      console.log('  Strategy Document:');
      console.log('    - RECOVERY_STRATEGY.md\n\n');
      
      console.log('📋 Next Steps:\n');
      console.log('  1. Review RECOVERY_STRATEGY.md for the complete plan');
      console.log('  2. Review all generated reports');
      console.log('  3. Create the uncommitted-files branch');
      console.log('  4. Begin implementing the priority PRs\n');

    } catch (error) {
      console.error('\n❌ Error during recovery process:', error);
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const recovery = new MasterRecovery();
  recovery.run();
}

export { MasterRecovery };
