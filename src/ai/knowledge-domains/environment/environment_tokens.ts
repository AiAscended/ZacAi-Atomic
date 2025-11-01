/**
 * File: src/ai/data/environment/environment_tokens.ts
 * Purpose: Domain-specific core tokens for environment/DevOps (CI/CD, deployment, configuration)
 * Depends on: None
 * Depended on by: environment_tokenizer.ts, environment_tokenMap.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const ENVIRONMENT_CORE_TOKENS = [
  "[PAD]",
  "[UNK]",
  "[CLS]",
  "[SEP]",
  "docker",
  "kubernetes",
  "ci/cd",
  "pipeline",
  "deploy",
  "build",
  "test",
  "staging",
  "production",
  "development",
  "environment",
  "variable",
  "config",
  "secret",
  "container",
  "image",
  "pod",
  "service",
  "ingress",
  "volume",
  "namespace",
  "helm",
  "terraform",
  "ansible",
  "jenkins",
  "github actions",
  "gitlab ci",
  "aws",
  "azure",
  "gcp",
  "<SYS_ENVIRONMENT>",
  "ENVIRONMENT_BASE",
  "ENVIRONMENT_SYS_TOKEN",
]

export const analyzeEnvironmentTokens = (tokens: string[]) => {
  const operations = {
    containerization: tokens.filter((t) => /docker|container|image|pod/.test(t.toLowerCase())).length,
    cicd: tokens.filter((t) => /ci|cd|pipeline|deploy|build/.test(t.toLowerCase())).length,
    cloud: tokens.filter((t) => /aws|azure|gcp|cloud/.test(t.toLowerCase())).length,
  }
  return operations
}

export default ENVIRONMENT_CORE_TOKENS
