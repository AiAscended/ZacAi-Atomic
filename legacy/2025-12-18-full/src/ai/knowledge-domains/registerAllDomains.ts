/**
 * File: src/ai/data/registerAllDomains.ts
 * Purpose: Import all domain integration APIs to trigger domain registration
 * This file must be imported before using the AI orchestrator
 */

// import "./registerAllUrlLookups"

// Import all domain integration APIs to trigger registration
import "./english/english_integrationAPI";
import "./general_knowledge/general_knowledge_integrationAPI";
import "./mathematics/mathematics_integrationAPI";
import "./typescript/typescript_integrationAPI";
import "./react/react_integrationAPI";
import "./nextjs/nextjs_integrationAPI";
import "./programming/programming_integrationAPI";
import "./internet_search/internet_search_integrationAPI";
import "./grammar/grammar_integrationAPI";
import "./science/science_integrationAPI";
import "./code_review/code_review_integrationAPI";
import "./error_detection/error_detection_integrationAPI";
import "./testing/testing_integrationAPI";
import "./documentation/documentation_integrationAPI";
import "./security/security_integrationAPI";
import "./algorithms/algorithms_integrationAPI";
import "./data_structures/data_structures_integrationAPI";
import "./version_control/version_control_integrationAPI";
import "./environment/environment_integrationAPI";
import "./data_integrity/data_integrity_integrationAPI";
import "./observability/observability_integrationAPI";
import "./repair/repair_integrationAPI";
import "./system/system_integrationAPI";

import { domainRegistry } from "./domainRegistry";

/**
 * Verify all domains are registered
 * Waits briefly for async init functions to complete
 */
export async function verifyDomains(): Promise<void> {
  // Wait for async domain init functions to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  const domains = domainRegistry.getAllDomains();
  console.log(
    `[v0] Registered ${domains.length} domains:`,
    domains.map((d) => d.name).join(", "),
  );

  if (domains.length === 0) {
    console.warn(
      `[v0] WARNING: No domains registered! Check that integration APIs are executing properly.`,
    );
  }
}

// Auto-verify on import (with delay for async init functions)
setTimeout(() => {
  verifyDomains().catch((err) =>
    console.error("[v0] Domain verification failed:", err),
  );
}, 200);
