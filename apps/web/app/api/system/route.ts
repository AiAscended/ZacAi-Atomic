import { NextResponse } from "next/server";
import { SystemAgent, SystemModel, SystemKernel } from "@zacai/core";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const promptText: string = body?.prompt ?? "";
    const mode: string | undefined = body?.mode;
    const kernel = new SystemKernel();
    const model = new SystemModel(kernel);
    const agent = new SystemAgent(model);

    const result = await agent.respond({ text: promptText, mode });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const kernel = new SystemKernel();
  const model = new SystemModel(kernel);
  const agent = new SystemAgent(model);
  const result = await agent.respond({ text: "health", mode: "status" });
  return NextResponse.json(result);
}
