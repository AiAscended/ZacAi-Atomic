/**
 * File: src/ai/knowledge_retrieval/factVerifier.ts
 * Purpose: Minimal fact verifier that checks whether a claim string exists in a set of trusted docs.
 */

import type { KBDocument } from "./localKBLoader";

export const verifyFact = (
  claim: string,
  trustedDocs: KBDocument[],
): { verdict: "supported" | "unsupported"; evidence?: string[] } => {
  const claimTokens = claim.toLowerCase().split(/\W+/).filter(Boolean);
  const matches: string[] = [];
  for (const d of trustedDocs) {
    const t = (d.title + " " + d.text).toLowerCase();
    if (claimTokens.every((tok) => t.includes(tok))) matches.push(d.id);
  }
  return {
    verdict: matches.length ? "supported" : "unsupported",
    evidence: matches,
  };
};
