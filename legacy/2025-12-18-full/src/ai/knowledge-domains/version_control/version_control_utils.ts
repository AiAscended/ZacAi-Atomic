/**
 * File: src/ai/data/version_control/version_control_utils.ts
 * Purpose: Shared utility functions for version_control domain
 * Depends on: None
 * Depended on by: All version_control domain files
 * Creator: Vercel v0 Coding Assistant
 */

export const normalizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
};

export const detectGitPatterns = (code: string) => {
  const patterns = {
    commit: /git commit|commit -m|commit --amend/gi,
    branch: /git branch|checkout -b|git switch/gi,
    merge: /git merge|merge --no-ff|merge conflict/gi,
    rebase: /git rebase|rebase -i|rebase --continue/gi,
    pull: /git pull|pull --rebase|pull origin/gi,
    push: /git push|push origin|push -f/gi,
  };

  const detected: string[] = [];
  for (const [operation, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      detected.push(operation);
    }
  }
  return detected;
};

export const safeParseJSON = (text: string, fallback: unknown = {}) => {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};
