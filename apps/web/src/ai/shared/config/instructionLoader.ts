/**
 * Fallback instruction loader. Returns null instructions in degraded mode.
 */

interface DomainInstructions {
  role?: string;
  capabilities?: string[];
  principles?: string[];
  admin_config?: Record<string, unknown>;
  url_lookup_config?: Record<string, unknown>;
}

export function getInstructionLoader() {
  return {
    async loadDomainInstructions(_domainId: string): Promise<DomainInstructions | null> {
      return null;
    },
  };
}
