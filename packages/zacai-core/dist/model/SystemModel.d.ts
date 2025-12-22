import type { SystemPrompt, SystemResponse } from "../types/index.js";
import { SystemKernel } from "../kernel/SystemKernel.js";
export declare class SystemModel {
    private kernel;
    constructor(kernel?: SystemKernel);
    handlePrompt(prompt: SystemPrompt): Promise<SystemResponse>;
}
//# sourceMappingURL=SystemModel.d.ts.map