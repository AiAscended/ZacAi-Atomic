import { NextRequest, NextResponse } from "next/server";
import { getAdminConfigResolver, ModuleType } from "@/ai/shared/loader/adminConfigResolver";

export const dynamic = "force-dynamic";

interface RouteParams {
  moduleType: string;
  moduleId: string;
}

const SUPPORTED_TYPES: ModuleType[] = ["domain", "model"];

export async function GET(_request: NextRequest, context: { params: RouteParams }) {
  const { moduleType, moduleId } = context.params;

  if (!moduleType || !moduleId) {
    return NextResponse.json(
      { success: false, error: "moduleType and moduleId are required" },
      { status: 400 },
    );
  }

  if (!SUPPORTED_TYPES.includes(moduleType as ModuleType)) {
    return NextResponse.json(
      { success: false, error: `Unsupported module type: ${moduleType}` },
      { status: 400 },
    );
  }

  try {
    const resolver = getAdminConfigResolver();
    const data = await resolver.getConfig(moduleType as ModuleType, moduleId);

    if (!data.adminConfig) {
      return NextResponse.json(
        { success: false, error: "Admin config not found for module" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Admin Config API] error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to load admin config", details: message },
      { status: 500 },
    );
  }
}
