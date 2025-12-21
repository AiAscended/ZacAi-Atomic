import type { SystemPrompt, SystemResponse } from "../types";
import { SystemModel } from "../model/SystemModel";

export class SystemAgent {
  private model: SystemModel;

  constructor(model?: SystemModel) {
    this.model = model ?? new SystemModel();
  }

  async respond(prompt: SystemPrompt): Promise<SystemResponse> {
    return this.model.handlePrompt(prompt);
  }
}
