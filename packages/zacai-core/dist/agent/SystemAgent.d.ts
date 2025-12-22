import type { SystemPrompt, SystemResponse } from "../types/index.js";
import { SystemModel } from "../model/SystemModel.js";
export declare class SystemAgent {
    private model;
    constructor(model?: SystemModel);
    respond(prompt: SystemPrompt): Promise<SystemResponse>;
}
//# sourceMappingURL=SystemAgent.d.ts.map