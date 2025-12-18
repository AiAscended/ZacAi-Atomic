import { NextResponse } from "next/server";
import { getModuleById } from "@/ai/shared/registry/unifiedRegistryReader";
import { getInstructionLoader } from "@/ai/shared/config/instructionLoader";

interface RouteParams {
  domain: string;
}

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: RouteParams }) {
  const { domain } = context.params;

  if (!domain) {
    return NextResponse.json({ success: false, error: "Domain id is required" }, { status: 400 });
  }

  try {
    const manifest = await getModuleById(domain);

    if (!manifest || manifest.moduleType !== "domain") {
      return NextResponse.json({ success: false, error: "Domain not found" }, { status: 404 });
    }

    const loader = getInstructionLoader();
    const instructions = await loader.loadDomainInstructions(domain);

    return NextResponse.json({
      success: true,
      data: {
        manifest,
        instructions: instructions
          ? {
              role: instructions.role,
              capabilities: instructions.capabilities,
              principles: instructions.principles,
              admin_config: instructions.admin_config,
              url_lookup_config: instructions.url_lookup_config,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[Domain Metadata API] error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
