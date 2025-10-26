/**
 * File: src/ai/knowledge_retrieval/ontologyManager.ts
 * Purpose: Minimal ontology manager storing simple concept relations.
 */

type Relation = { from: string; to: string; type?: string };

const relations: Relation[] = [];

export const addRelation = (from: string, to: string, type = 'related') =>
  relations.push({ from, to, type });

export const queryRelated = (concept: string) =>
  relations.filter((r) => r.from === concept || r.to === concept);

export const clearOntology = () => relations.splice(0, relations.length);
