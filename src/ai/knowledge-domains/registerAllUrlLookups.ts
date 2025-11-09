/**
 * File: src/ai/data/registerAllUrlLookups.ts
 * Purpose: Imports all domain URL lookup files to register official source URLs
 * This ensures all domains have access to their canonical reference sources
 */

// Import all domain URL lookup files to register their sources
import "./english/english_url_lookup";
import "./general_knowledge/general_knowledge_url_lookup";
import "./internet_search/internet_search_url_lookup";
import "./mathematics/mathematics_url_lookup";
import "./typescript/typescript_url_lookup";
import "./grammar/grammar_url_lookup";
import "./science/science_url_lookup";
import "./code_review/code_review_url_lookup";
import "./error_detection/error_detection_url_lookup";
import "./testing/testing_url_lookup";
import "./documentation/documentation_url_lookup";
import "./security/security_url_lookup";
import "./data_structures/data_structures_url_lookup";
import "./algorithms/algorithms_url_lookup";
import "./version_control/version_control_url_lookup";
import "./environment/environment_url_lookup";

export { findSources, registerSource } from "./url_lookup";
