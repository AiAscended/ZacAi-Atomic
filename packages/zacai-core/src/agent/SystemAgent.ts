import type { SystemPrompt, SystemResponse } from "../types/index.js";
import { SystemModel } from "../model/SystemModel.js";

export class SystemAgent {
  private model: SystemModel;

  constructor(model?: SystemModel) {
    this.model = model ?? new SystemModel();
  }

  async respond(prompt: SystemPrompt): Promise<SystemResponse> {
    return this.model.handlePrompt(prompt);
  }
}
