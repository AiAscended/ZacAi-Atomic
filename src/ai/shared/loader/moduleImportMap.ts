import type { ModuleType } from "../registry/unifiedRegistry"

type ModuleImporter = () => Promise<unknown>

type ModuleImportMap = Record<string, ModuleImporter>

const domainIntegrationImports: ModuleImportMap = {
  algorithms: () => import("@/ai/knowledge-domains/algorithms/algorithms_integrationAPI"),
  code_review: () => import("@/ai/knowledge-domains/code_review/code_review_integrationAPI"),
  data_integrity: () => import("@/ai/knowledge-domains/data_integrity/data_integrity_integrationAPI"),
  data_structures: () => import("@/ai/knowledge-domains/data_structures/data_structures_integrationAPI"),
  documentation: () => import("@/ai/knowledge-domains/documentation/documentation_integrationAPI"),
  english: () => import("@/ai/knowledge-domains/english/english_integrationAPI"),
  environment: () => import("@/ai/knowledge-domains/environment/environment_integrationAPI"),
  error_detection: () => import("@/ai/knowledge-domains/error_detection/error_detection_integrationAPI"),
  general_knowledge: () => import("@/ai/knowledge-domains/general_knowledge/general_knowledge_integrationAPI"),
  grammar: () => import("@/ai/knowledge-domains/grammar/grammar_integrationAPI"),
  internet_search: () => import("@/ai/knowledge-domains/internet_search/internet_search_integrationAPI"),
  mathematics: () => import("@/ai/knowledge-domains/mathematics/mathematics_integrationAPI"),
  nextjs: () => import("@/ai/knowledge-domains/nextjs/nextjs_integrationAPI"),
  observability: () => import("@/ai/knowledge-domains/observability/observability_integrationAPI"),
  programming: () => import("@/ai/knowledge-domains/programming/programming_integrationAPI"),
  react: () => import("@/ai/knowledge-domains/react/react_integrationAPI"),
  repair: () => import("@/ai/knowledge-domains/repair/repair_integrationAPI"),
  science: () => import("@/ai/knowledge-domains/science/science_integrationAPI"),
  security: () => import("@/ai/knowledge-domains/security/security_integrationAPI"),
  system: () => import("@/ai/knowledge-domains/system/system_integrationAPI"),
  testing: () => import("@/ai/knowledge-domains/testing/testing_integrationAPI"),
  typescript: () => import("@/ai/knowledge-domains/typescript/typescript_integrationAPI"),
  version_control: () => import("@/ai/knowledge-domains/version_control/version_control_integrationAPI"),
}

const domainInferenceImports: ModuleImportMap = {
  algorithms: () => import("@/ai/knowledge-domains/algorithms/algorithms_inferenceController"),
  code_review: () => import("@/ai/knowledge-domains/code_review/code_review_inferenceController"),
  data_integrity: () => import("@/ai/knowledge-domains/data_integrity/data_integrity_inferenceController"),
  data_structures: () => import("@/ai/knowledge-domains/data_structures/data_structures_inferenceController"),
  documentation: () => import("@/ai/knowledge-domains/documentation/documentation_inferenceController"),
  english: () => import("@/ai/knowledge-domains/english/english_inferenceController"),
  environment: () => import("@/ai/knowledge-domains/environment/environment_inferenceController"),
  error_detection: () => import("@/ai/knowledge-domains/error_detection/error_detection_inferenceController"),
  general_knowledge: () => import("@/ai/knowledge-domains/general_knowledge/general_knowledge_inferenceController"),
  grammar: () => import("@/ai/knowledge-domains/grammar/grammar_inferenceController"),
  internet_search: () => import("@/ai/knowledge-domains/internet_search/internet_search_inferenceController"),
  mathematics: () => import("@/ai/knowledge-domains/mathematics/mathematics_inferenceController"),
  nextjs: () => import("@/ai/knowledge-domains/nextjs/nextjs_inferenceController"),
  observability: () => import("@/ai/knowledge-domains/observability/observability_inferenceController"),
  programming: () => import("@/ai/knowledge-domains/programming/programming_inferenceController"),
  react: () => import("@/ai/knowledge-domains/react/react_inferenceController"),
  repair: () => import("@/ai/knowledge-domains/repair/repair_inferenceController"),
  science: () => import("@/ai/knowledge-domains/science/science_inferenceController"),
  security: () => import("@/ai/knowledge-domains/security/security_inferenceController"),
  system: () => import("@/ai/knowledge-domains/system/system_inferenceController"),
  testing: () => import("@/ai/knowledge-domains/testing/testing_inferenceController"),
  typescript: () => import("@/ai/knowledge-domains/typescript/typescript_inferenceController"),
  version_control: () => import("@/ai/knowledge-domains/version_control/version_control_inferenceController"),
}

const modelInferenceImports: ModuleImportMap = {
  "unified-transformer-llm": () => import("@/ai/models/unified-transformer-llm/unified-transformer-llm_inference/llm-inferenceEngine"),
}

export function getModuleImporter(moduleId: string, moduleType: ModuleType): ModuleImporter | null {
  if (moduleType === "model") {
    return modelInferenceImports[moduleId] ?? null
  }

  return domainIntegrationImports[moduleId] ?? null
}

export function getDomainInferenceImporter(domainId: string): ModuleImporter | null {
  return domainInferenceImports[domainId] ?? null
}

export function getModelInferenceImporter(modelId: string): ModuleImporter | null {
  return modelInferenceImports[modelId] ?? null
}
