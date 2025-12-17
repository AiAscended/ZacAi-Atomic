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
  try {
    const modules = await getModulesByType("domain");
    const data = modules.map(mapModuleToDomain).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Admin Domains API] Failed to load registry", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
