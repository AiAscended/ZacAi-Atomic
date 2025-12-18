/**
 * File: src/ai/data/code_review/code_review_url_lookup.ts
 * Purpose: Register canonical code review reference sources
 * Depends on: ../url_lookup.ts
 * Depended on by: None (auto-registers on import)
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup";

registerSource(
  "code_review",
  "Clean Code",
  "https://www.oreilly.com/library/view/clean-code/9780136083238/",
  "Code quality principles",
);
registerSource(
  "code_review",
  "Refactoring Guru",
  "https://refactoring.guru",
  "Code smells and refactoring",
);
registerSource(
  "code_review",
  "SonarQube",
  "https://www.sonarqube.org",
  "Code quality metrics",
);

export const codeReviewSources = () => registerSource;

export default codeReviewSources;
