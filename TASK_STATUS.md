# Task Status: Copy .github Files to Version Branches

## Objective
Copy all files from the `.github` folder in the `v0.0.9-merge-uncommitted-files` branch to:
- `ZacAi-Hybrid-LLM-v0.1.0` 
- `ZacAi-Hybrid-LLM-v0.1.1`

## Files to Copy

### From: `v0.0.9-merge-uncommitted-files` branch

1. **Root file:**
   - `.github/copilot-instructions.md`

2. **instructions/ directory (4 files):**
   - `.github/instructions/zacai-core-kernel.instructions.md`
   - `.github/instructions/zacai-orchestration-model.instructions.md`
   - `.github/instructions/zacai-rust-engines.instructions.md`
   - `.github/instructions/zacai-system-model.instructions.md`

3. **prompts/ directory (3 files):**
   - `.github/prompts/add-rust-wasm-engine.prompt.md`
   - `.github/prompts/implement-zacai-feature.prompt.md`
   - `.github/prompts/refactor-core-module.prompt.md`

4. **workflows/ directory (1 file):**
   - `.github/workflows/ci.yml`

**Total: 9 files**

## Current Status

### Blockers
I'm unable to access the source files due to environment limitations:
- Git fetch requires authentication (not available)
- GitHub API access is blocked by DNS monitoring proxy
- Raw file downloads return 404/403 errors
- Local repository only has grafted history with 2 commits

### Target Branches Status
Both `ZacAi-Hybrid-LLM-v0.1.0` and `ZacAi-Hybrid-LLM-v0.1.1` currently only have:
- `.github/workflows/` directory

They are missing the `instructions/` and `prompts/` directories, as well as the root `copilot-instructions.md` file.

## Required Actions

To proceed, one of the following is needed:

### Option 1: Merge Source Branch (Recommended)
```bash
git checkout copilot/copy-github-files-to-versions
git merge origin/v0.0.9-merge-uncommitted-files --no-edit
git push
```

### Option 2: Manual File Addition
Manually copy the 9 files listed above from `v0.0.9-merge-uncommitted-files` into this PR branch.

### Option 3: Grant Access
Configure the environment to allow:
- Git fetch from origin without authentication, or
- GitHub API access through the proxy

## Next Steps

Once the files are accessible in this branch, I will:
1. Copy all `.github` files to branch `ZacAi-Hybrid-LLM-v0.1.0`
2. Copy all `.github` files to branch `ZacAi-Hybrid-LLM-v0.1.1`
3. Verify the changes on both branches
4. Complete the task
