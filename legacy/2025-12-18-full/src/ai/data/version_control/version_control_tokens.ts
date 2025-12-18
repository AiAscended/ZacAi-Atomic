/**
 * File: src/ai/data/version_control/version_control_tokens.ts
 * Purpose: Domain-specific core tokens for version control (git, branching, merging)
 * Depends on: None
 * Depended on by: version_control_tokenizer.ts, version_control_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const VERSION_CONTROL_CORE_TOKENS = [
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "git",
  "commit",
  "branch",
  "merge",
  "pull",
  "push",
  "clone",
  "fork",
  "rebase",
  "cherry-pick",
  "stash",
  "tag",
  "remote",
  "origin",
  "upstream",
  "HEAD",
  "master",
  "main",
  "develop",
  "feature",
  "hotfix",
  "conflict",
  "resolve",
  "diff",
  "log",
  "status",
  "add",
  "reset",
  "checkout",
  "<SYS_VERSION_CONTROL>",
  "VERSION_CONTROL_BASE",
  "VERSION_CONTROL_SYS_TOKEN",
]

export const analyzeVersionControlTokens = (tokens: string[]) => {
  const operations = {
    commits: tokens.filter((t) => /commit|push|pull/.test(t.toLowerCase())).length,
    branching: tokens.filter((t) => /branch|checkout|merge/.test(t.toLowerCase())).length,
    conflicts: tokens.filter((t) => /conflict|resolve|rebase/.test(t.toLowerCase())).length,
  }
  return operations
}

export default VERSION_CONTROL_CORE_TOKENS
