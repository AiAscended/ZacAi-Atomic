import { SystemModel } from "../model/SystemModel.js";
export class SystemAgent {
    constructor(model) {
        this.model = model ?? new SystemModel();
    }
    async respond(prompt) {
        return this.model.handlePrompt(prompt);
    }
}
//# sourceMappingURL=SystemAgent.js.map