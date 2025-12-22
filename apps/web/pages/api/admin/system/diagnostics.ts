import type { NextApiRequest, NextApiResponse } from "next";
import { SystemKernel } from "@/../../packages/zacai-core/src/kernel/SystemKernel";
import { ModuleRegistry } from "@/../../packages/zacai-core/src/registries/module-registry";
import { Heartbeat } from "@/../../packages/zacai-core/src/heartbeat";
import { Diagnostics } from "@/../../packages/zacai-core/src/diagnostics/Diagnostics";

const kernel = new SystemKernel();
const registry = new ModuleRegistry();
const heartbeat = new Heartbeat();
const diagnostics = new Diagnostics(kernel, registry, heartbeat);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await diagnostics.runFullDiagnostics();
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
