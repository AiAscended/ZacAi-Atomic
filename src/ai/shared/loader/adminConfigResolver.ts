import { AdminConfig, InstructionSet, getInstructionLoader } from "../config/instructionLoader";

export type ModuleType = "domain" | "model";

export interface AdminConfigResponse {
  moduleId: string;
  moduleType: ModuleType;
  adminConfig: AdminConfig | null;
}

export class AdminConfigResolver {
  async getConfig(moduleType: ModuleType, moduleId: string): Promise<AdminConfigResponse> {
    const loader = getInstructionLoader();
    let instructions: InstructionSet | null = null;

    if (moduleType === "domain") {
      instructions = await loader.loadDomainInstructions(moduleId);
    } else if (moduleType === "model") {
      instructions = await loader.loadModelInstructions(moduleId);
    } else {
      throw new Error(`Unsupported module type: ${moduleType}`);
    }

    return {
      moduleId,
      moduleType,
      adminConfig: instructions?.admin_config ?? null,
    };
  }
}

let resolverInstance: AdminConfigResolver | null = null;

export function getAdminConfigResolver(): AdminConfigResolver {
  if (!resolverInstance) {
    resolverInstance = new AdminConfigResolver();
  }
  return resolverInstance;
}
