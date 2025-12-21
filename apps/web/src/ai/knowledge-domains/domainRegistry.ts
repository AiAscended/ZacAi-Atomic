/**
 * Minimal in-memory domain registry used when the full knowledge-domain
 * inventory is unavailable. Provides a graceful, non-fatal fallback so
 * the system can continue operating in a degraded mode.
 */

export type DomainStatus = "online" | "degraded" | "offline";

export interface DomainInfo {
  id: string;
  name: string;
  description?: string;
  status: DomainStatus;
  lastCheckedAt?: number;
  notes?: string;
}

let domains: DomainInfo[] = [];
let initialized = false;

function ensureFallback() {
  if (initialized) return;
  const now = Date.now();
  domains = [
    {
      id: "fallback",
      name: "Fallback Domain",
      description: "Placeholder domain while registry is offline",
      status: "degraded",
      lastCheckedAt: now,
      notes: "auto-registered fallback entry",
    },
  ];
  initialized = true;
}

export const domainRegistry = {
  getAllDomains(): DomainInfo[] {
    ensureFallback();
    return [...domains];
  },

  registerDomain(domain: DomainInfo) {
    initialized = true;
    const idx = domains.findIndex((d) => d.id === domain.id);
    if (idx >= 0) {
      domains[idx] = { ...domain };
    } else {
      domains.push({ ...domain });
    }
  },

  reset(nextDomains?: DomainInfo[]) {
    domains = nextDomains ? [...nextDomains] : [];
    initialized = false;
  },

  ensureFallback,

  healthSummary() {
    ensureFallback();
    const online = domains.filter((d) => d.status === "online").length;
    const degraded = domains.filter((d) => d.status === "degraded").length;
    const offline = domains.filter((d) => d.status === "offline").length;
    return {
      total: domains.length,
      online,
      degraded,
      offline,
      updatedAt: Date.now(),
    };
  },
};
