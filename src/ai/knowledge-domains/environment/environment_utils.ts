/**
 * File: src/ai/data/environment/environment_utils.ts
 * Purpose: Shared utility functions for environment domain
 * Depends on: None
 * Depended on by: All environment domain files
 * Creator: Vercel v0 Coding Assistant
 */

export const normalizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export const detectDevOpsPatterns = (code: string) => {
  const patterns = {
    docker: /dockerfile|docker-compose|docker build|docker run/gi,
    kubernetes: /kubectl|k8s|deployment\.yaml|service\.yaml/gi,
    cicd: /\.github\/workflows|\.gitlab-ci|jenkinsfile|pipeline/gi,
    terraform: /terraform|\.tf|resource|provider/gi,
    ansible: /ansible|playbook|\.yml|tasks:/gi,
    envVars: /process\.env|ENV|environment variables/gi,
  }

  const detected: string[] = []
  for (const [tool, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      detected.push(tool)
    }
  }
  return detected
}

export const safeParseJSON = (text: string, fallback: unknown = {}) => {
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}
