# Branch Recovery System

This directory contains scripts for analyzing and consolidating files from all branches in the ZacAi-Atomic repository.

## Problem Statement

The repository has 56+ branches with many files that were never merged to `main`, resulting in:
- Lost functionality
- Fragmented codebase
- Stuck pull requests (#33, #34, #37)
- Difficulty tracking what's in each branch

## Solution

An automated system that:
1. Analyzes all branches and identifies unique files
2. Plans file consolidation from all branches
3. Generates comparison reports
4. Documents a recovery strategy

## Quick Start

### Run Complete Analysis

```bash
npm run recovery:full
```

This single command runs all four phases and generates all reports.

### Run Individual Phases

```bash
# Phase 1: Analyze all branches
npm run recovery:analyze

# Phase 2: Plan file consolidation  
npm run recovery:consolidate

# Phase 3: Generate comparison reports
npm run recovery:compare

# Phase 4: Generate recovery strategy
npm run recovery:strategy
```

## Scripts

### `analyze-branches.ts`

Fetches file lists from all 56 branches and compares them.

**Generates:**
- `BRANCH_ANALYSIS.md` - Files unique to each branch
- `MISSING_FROM_MAIN.md` - Files in other branches but not in main
- `MISSING_FROM_V009.md` - Files missing from v0.0.9
- `branch-analysis-manifest.json` - Machine-readable data

**Usage:**
```bash
npm run recovery:analyze
```

### `consolidate-files.ts`

Analyzes file occurrences and creates a consolidation plan.

**Generates:**
- `CONSOLIDATION_REPORT.md` - Detailed consolidation plan
- `consolidation-plan.json` - Machine-readable plan
- `scripts/consolidate.sh` - Shell script template

**Usage:**
```bash
npm run recovery:consolidate
```

**Note:** Requires `branch-analysis-manifest.json` from analyze-branches.ts

### `generate-comparison-reports.ts`

Creates detailed comparisons between branches.

**Generates:**
- `COMPARISON_UNCOMMITTED_VS_MAIN.md`
- `COMPARISON_UNCOMMITTED_VS_V009.md`
- `COMPARISON_MAIN_VS_V009.md`

**Usage:**
```bash
npm run recovery:compare
```

### `generate-recovery-strategy.ts`

Documents the complete recovery strategy.

**Generates:**
- `RECOVERY_STRATEGY.md` - Complete implementation plan with:
  - Priority ordering
  - PR sequence recommendations
  - Timeline estimates
  - Risk mitigation strategies

**Usage:**
```bash
npm run recovery:strategy
```

### `run-full-recovery.ts`

Master script that orchestrates all phases.

**Usage:**
```bash
npm run recovery:full
```

## Output Files

### Analysis Reports
- **BRANCH_ANALYSIS.md** - Overview of all branches and their unique files
- **MISSING_FROM_MAIN.md** - Files that exist in branches but not in main
- **MISSING_FROM_V009.md** - Files missing from the v0.0.9 release branch

### Consolidation Planning
- **CONSOLIDATION_REPORT.md** - Plan for merging files, including conflicts
- **consolidation-plan.json** - Programmatic consolidation data
- **scripts/consolidate.sh** - Template script for file consolidation

### Comparison Reports
- **COMPARISON_UNCOMMITTED_VS_MAIN.md** - What would be gained by merging
- **COMPARISON_UNCOMMITTED_VS_V009.md** - What v0.0.9 is missing
- **COMPARISON_MAIN_VS_V009.md** - Direct comparison of main and v0.0.9

### Strategy
- **RECOVERY_STRATEGY.md** - Complete recovery implementation guide

### Data Files
- **branch-analysis-manifest.json** - Raw analysis data
- **consolidation-plan.json** - File consolidation metadata

## Requirements

- Node.js 18+
- TypeScript
- `@octokit/rest` for GitHub API access
- Optional: `GITHUB_TOKEN` environment variable (increases rate limits)

## GitHub Token (Optional)

To avoid GitHub API rate limits, set a token:

```bash
export GITHUB_TOKEN="your_github_token_here"
npm run recovery:full
```

Without a token:
- Unauthenticated: 60 requests/hour
- With token: 5000 requests/hour

## Workflow

1. **Run Analysis** (`npm run recovery:full`)
   - Scans all 56 branches
   - Identifies unique files
   - Creates detailed reports

2. **Review Reports**
   - Read `RECOVERY_STRATEGY.md` first
   - Review `BRANCH_ANALYSIS.md` for overview
   - Check `CONSOLIDATION_REPORT.md` for conflicts

3. **Create Consolidation Branch**
   - Use the consolidation plan
   - Create `uncommitted-files` branch from `main`
   - Copy files according to the plan

4. **Create PRs**
   - Follow the PR sequence in `RECOVERY_STRATEGY.md`
   - Start with critical infrastructure
   - Test each PR before merging

5. **Resolve Stuck PRs**
   - Review PRs #33, #34, #37
   - Follow strategy in `RECOVERY_STRATEGY.md`
   - Close or update as needed

## Architecture

```
scripts/
├── analyze-branches.ts           # Phase 1: Branch analysis
├── consolidate-files.ts          # Phase 2: Consolidation planning
├── generate-comparison-reports.ts # Phase 3: Comparisons
├── generate-recovery-strategy.ts # Phase 4: Strategy docs
└── run-full-recovery.ts          # Master orchestrator
```

Each script:
- Can run independently
- Exports a class for programmatic use
- Includes detailed console output
- Generates both markdown and JSON outputs

## Features

### Incremental Support
- Scripts check for existing data files
- Can re-run without re-fetching everything
- Respects GitHub API rate limits

### Conflict Detection
- Identifies files that exist in multiple branches
- Detects when files have different content (SHA)
- Provides resolution guidance

### Priority Classification
- Categorizes files by type (AI, UI, config, etc.)
- Recommends merge priority
- Estimates impact and risk

### Metadata Tracking
- Records source branch for each file
- Tracks commit SHAs
- Notes alternative branches with same file

## Troubleshooting

### Rate Limit Errors
```
Error: API rate limit exceeded
```
**Solution:** Add a GitHub token or wait for rate limit reset

### Missing Dependencies
```
Error: Cannot find module '@octokit/rest'
```
**Solution:** Run `npm install`

### File Not Found Errors
```
Error: branch-analysis-manifest.json not found
```
**Solution:** Run `npm run recovery:analyze` first

## Contributing

When modifying these scripts:
1. Keep console output clear and informative
2. Generate both human-readable (MD) and machine-readable (JSON) outputs
3. Handle errors gracefully
4. Add delay between API calls for rate limiting

## License

MIT - Same as main project
