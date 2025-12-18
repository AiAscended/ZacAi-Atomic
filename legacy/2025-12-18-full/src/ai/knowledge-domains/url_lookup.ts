/**
 * File: src/ai/data/url_lookup.ts
 * Purpose: Small helper that provides URL lookup/resolution for domains.
 * Domains can register domain-specific sources and the orchestrator or
 * data ingestion pipelines can query them for canonical sources.
 */

type SourceRecord = {
  domain: string;
  name: string;
  url: string;
  description?: string;
  searchPath?: string;
};

const sources: SourceRecord[] = [];

export const registerSource = (
  domain: string,
  name: string,
  url: string,
  description?: string,
) => {
  sources.push({ domain, name, url, description });
};

export const findSources = (domain?: string) => {
  if (!domain) return sources.slice();
  return sources.filter((s) => s.domain === domain);
};
const urlLookupApi = { registerSource, findSources };

const url_lookup_bundle = { registerSource, findSources };

export default url_lookup_bundle;
