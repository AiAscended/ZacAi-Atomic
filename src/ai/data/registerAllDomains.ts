/**
 * File: src/ai/data/registerAllDomains.ts
 * Purpose: Import all domain integration APIs to trigger domain registration
 * This file must be imported before using the AI orchestrator
 */

import "./registerAllUrlLookups"

// Import all domain integration APIs to trigger registration
import "./english/english_integrationAPI"
import "./general/general_integrationAPI"
import "./mathematics/mathematics_integrationAPI"
import "./typescript/typescript_integrationAPI"
import "./internet_search/internet_search_integrationAPI"
import "./grammar/grammar_integrationAPI"
import "./science/science_integrationAPI"
import "./code_review/code_review_integrationAPI"
import "./error_detection/error_detection_integrationAPI"
import "./testing/testing_integrationAPI"
import "./documentation/documentation_integrationAPI"
import "./security/security_integrationAPI"
import "./algorithms/algorithms_integrationAPI"
import "./data_structures/data_structures_integrationAPI"
import "./version_control/version_control_integrationAPI"
import "./environment/environment_integrationAPI"

import { listDomains } from "./registry"

/**
 * Verify all domains are registered
 */
export function verifyDomains(): void {
  const domains = listDomains()
  console.log(`[v0] Registered ${domains.length} domains:`, domains.map((d) => d.name).join(", "))
}

// Auto-verify on import
verifyDomains()
