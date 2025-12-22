import { NextResponse } from "next/server";
import { SystemKernel } from "@/../../packages/zacai-core/src/kernel/SystemKernel";
import { ModuleRegistry } from "@/../../packages/zacai-core/src/registries/module-registry";
import { Heartbeat } from "@/../../packages/zacai-core/src/heartbeat";
import { Diagnostics } from "@/../../packages/zacai-core/src/diagnostics/Diagnostics";

const kernel = new SystemKernel();
const registry = new ModuleRegistry();
const heartbeat = new Heartbeat();
const diagnostics = new Diagnostics(kernel, registry, heartbeat);

export async function GET() {
  try {
    const result = await diagnostics.runFullDiagnostics();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
