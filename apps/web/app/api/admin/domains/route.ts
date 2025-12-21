import { NextResponse } from "next/server";
import { getModulesByType } from "@/ai/shared/registry/unifiedRegistryReader";
import type { ModuleManifest } from "@/ai/shared/registry/unifiedRegistry";

const CATEGORY_OVERRIDES: Record<string, DomainCategory> = {
  english: "language",
  grammar: "language",
  general_knowledge: "language",
  programming: "technical",
  typescript: "technical",
  react: "technical",
  nextjs: "technical",
  algorithms: "science",
  data_structures: "science",
  mathematics: "science",
  science: "science",
  environment: "system",
  system: "system",
  security: "system",
  repair: "system",
  data_integrity: "system",
  observability: "system",
  testing: "development",
  documentation: "development",
  error_detection: "development",
  code_review: "development",
  version_control: "development",
  internet_search: "technical",
};

type DomainCategory = "language" | "technical" | "development" | "science" | "system" | "other";

interface DomainSummary {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: DomainCategory;
  path: string;
}

function mapModuleToDomain(module: ModuleManifest): DomainSummary {
  const category = CATEGORY_OVERRIDES[module.moduleId] ?? "other";
  return {
    id: module.moduleId,
    name: module.displayName,
    description: module.description,
    enabled: module.enabled,
    category,
    path: `/admin/domains/${module.moduleId}`,
  };
}

export async function GET() {
  return NextResponse.json({
    status: "maintenance",
    message: "This endpoint is in maintenance mode. Core system functions remain online.",
    timestamp: new Date().toISOString(),
  }, { status: 503 });
}
