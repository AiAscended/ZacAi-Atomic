/**
 * File: src/ai/data/react/react_url_lookup.ts
 * Purpose: Provide URL references for React documentation and resources
 * Depends on: react_constants.ts
 * Depended on by: react_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup";

export interface ReactDocReference {
  title: string;
  url: string;
  topics: string[];
  description: string;
}

export const REACT_DOC_REFERENCES: ReactDocReference[] = [
  {
    title: "React Official Documentation",
    url: "https://react.dev",
    topics: ["general", "getting-started", "tutorial"],
    description: "Official React documentation and guides",
  },
  {
    title: "React Hooks API Reference",
    url: "https://react.dev/reference/react",
    topics: ["hooks", "useState", "useEffect", "useContext", "useReducer"],
    description: "Complete reference for all React Hooks",
  },
  {
    title: "React Components Reference",
    url: "https://react.dev/reference/react/components",
    topics: ["components", "Fragment", "Suspense", "StrictMode"],
    description: "Built-in React components reference",
  },
  {
    title: "React Patterns",
    url: "https://react.dev/learn",
    topics: ["patterns", "best-practices", "composition", "performance"],
    description: "Learn React patterns and best practices",
  },
];

registerSource(
  "react",
  "React Official Docs",
  "https://react.dev",
  "Official React documentation and guides",
);
registerSource(
  "react",
  "React Hooks Reference",
  "https://react.dev/reference/react",
  "Complete reference for all React Hooks",
);
registerSource(
  "react",
  "React Components Reference",
  "https://react.dev/reference/react/components",
  "Built-in React components reference",
);
registerSource(
  "react",
  "React Patterns",
  "https://react.dev/learn",
  "Learn React patterns and best practices",
);

export function findReactDocumentation(query: string): ReactDocReference[] {
  const lowerQuery = query.toLowerCase();
  return REACT_DOC_REFERENCES.filter(
    (ref) =>
      ref.title.toLowerCase().includes(lowerQuery) ||
      ref.description.toLowerCase().includes(lowerQuery) ||
      ref.topics.some((topic) => topic.toLowerCase().includes(lowerQuery)),
  );
}

export default () => registerSource;
