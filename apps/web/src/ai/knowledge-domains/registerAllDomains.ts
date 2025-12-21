/**
 * Registers a minimal fallback domain set. In the full system this would
 * discover and register all knowledge domains. When those modules are
 * offline, we keep the app alive by seeding a degraded placeholder.
 */

import { domainRegistry } from "./domainRegistry";

let registered = false;

export function registerAllDomains() {
  if (registered) return;
  domainRegistry.ensureFallback();
  registered = true;
}
