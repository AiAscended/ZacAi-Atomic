import React from 'react';
import { useEditorStore } from './editorStore';

export interface AIIDEContext {
  currentFile?: {
    path: string;
    content: string;
    language: string;
    cursorPosition?: { line: number; column: number };
  };
  openFiles: string[];
  projectStructure?: string;
  recentErrors?: string[];
}

export interface AICodeAction {
  type: 'explain' | 'fix' | 'optimize' | 'generate' | 'refactor' | 'document';
  context: AIIDEContext;
  userPrompt: string;
}

export interface AIResponse {
  content: string;
  code?: {
    language: string;
    content: string;
    filename?: string;
  }[];
  actions?: {
    type: 'create-file' | 'update-file' | 'open-file';
    path: string;
    content?: string;
  }[];
}

class AIIDEIntegration {
  private sessionId: string | null = null;

  async initialize(): Promise<string | null> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (typeof data.sessionId !== 'string') {
        console.error('Failed to retrieve a valid session ID from API.');
        this.sessionId = null;
        return null;
      }
      
      this.sessionId = data.sessionId;
      return this.sessionId;
    } catch (error) {
      console.error('Failed to initialize AI session:', error);
      throw error;
    }
  }

  async sendMessage(
    message: string,
    context?: AIIDEContext
  ): Promise<AIResponse> {
    if (!this.sessionId) {
      await this.initialize();
      if (!this.sessionId) {
        throw new Error("Could not initialize AI session. Please try again.");
      }
    }

    try {
      // Enhance message with IDE context
      const enhancedMessage = this.buildContextualPrompt(message, context);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          sessionId: this.sessionId,
          message: enhancedMessage,
          context: {
            environment: 'ide',
            currentFile: context?.currentFile?.path,
            language: context?.currentFile?.language,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.response);
    } catch (error) {
      console.error('Failed to send message to AI:', error);
      throw error;
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    const context = this.getCurrentContext();
    const response = await this.sendMessage(
      `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      context
    );
    return response.content;
  }

  async fixCode(code: string, error: string, language: string): Promise<AIResponse> {
    const context = this.getCurrentContext();
    const response = await this.sendMessage(
      `Fix this ${language} code that has the following error:\n\nError: ${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the corrected code.`,
      context
    );
    return response;
  }

  async optimizeCode(code: string, language: string): Promise<AIResponse> {
    const context = this.getCurrentContext();
    const response = await this.sendMessage(
      `Optimize this ${language} code for better performance and readability:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      context
    );
    return response;
  }

  async generateCode(prompt: string, language?: string): Promise<AIResponse> {
    const context = this.getCurrentContext();
    const langHint = language ? ` in ${language}` : '';
    const response = await this.sendMessage(
      `Generate code${langHint} for: ${prompt}\n\nProvide complete, production-ready code with comments.`,
      context
    );
    return response;
  }

  async refactorCode(code: string, language: string, goal: string): Promise<AIResponse> {
    const context = this.getCurrentContext();
    const response = await this.sendMessage(
      `Refactor this ${language} code to ${goal}:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      context
    );
    return response;
  }

  async documentCode(code: string, language: string): Promise<AIResponse> {
    const context = this.getCurrentContext();
    const response = await this.sendMessage(
      `Add comprehensive documentation and comments to this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      context
    );
    return response;
  }

  async suggestFix(errorMessage: string): Promise<string> {
    const context = this.getCurrentContext();
    const response = await this.sendMessage(
      `I'm getting this error in my code:\n\n${errorMessage}\n\nWhat might be causing this and how can I fix it?`,
      context
    );
    return response.content;
  }

  async codeReview(code: string, language: string): Promise<string> {
    const context = this.getCurrentContext();
    const response = await this.sendMessage(
      `Review this ${language} code for:\n- Best practices\n- Potential bugs\n- Performance issues\n- Security concerns\n- Code style\n\n\`\`\`${language}\n${code}\n\`\`\``,
      context
    );
    return response.content;
  }

  private getCurrentContext(): AIIDEContext {
    const editorStore = useEditorStore.getState();
    const activeTab = editorStore.getActiveTab();

    return {
      currentFile: activeTab ? {
        path: activeTab.path,
        content: activeTab.content,
        language: activeTab.language,
        cursorPosition: activeTab.cursorPosition,
      } : undefined,
      openFiles: editorStore.tabs.map(tab => tab.path),
    };
  }

  private buildContextualPrompt(message: string, context?: AIIDEContext): string {
    let prompt = message;

    if (context?.currentFile) {
      prompt += `\n\n[Context: Working in ${context.currentFile.path}`;
      if (context.currentFile.cursorPosition) {
        prompt += ` at line ${context.currentFile.cursorPosition.line}`;
      }
      prompt += ']';
    }

    if (context?.openFiles && context.openFiles.length > 1) {
      prompt += `\n[Open files: ${context.openFiles.slice(0, 5).join(', ')}${
        context.openFiles.length > 5 ? `, +${context.openFiles.length - 5} more` : ''
      }]`;
    }

    return prompt;
  }

  private parseAIResponse(rawResponse: string | Record<string, unknown>): AIResponse {
    if (typeof rawResponse !== 'string') {
      // If the response is already an object, assume it's structured and return it.
      // This handles cases where the API directly returns JSON.
      return {
        content: (rawResponse.content as string) || JSON.stringify(rawResponse),
        code: (rawResponse.code as []) || [],
        actions: (rawResponse.actions as []) || [],
      };
    }

    const response: AIResponse = {
      content: rawResponse,
      code: [],
      actions: [],
    };

    // Extract code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(rawResponse)) !== null) {
      const language = match[1] || 'plaintext';
      const content = match[2].trim();
      
      if (!response.code) response.code = [];
      response.code.push({
        language,
        content,
      });
    }

    // Extract file creation/update actions
    const fileActionRegex = /\[ACTION:(\w+):(.+?)\]/g;
    while ((match = fileActionRegex.exec(rawResponse)) !== null) {
      const actionType = match[1].toLowerCase();
      const filePath = match[2].trim();

      if (actionType === 'create' || actionType === 'update' || actionType === 'open') {
        if (!response.actions) response.actions = [];
        response.actions.push({
          type: `${actionType}-file` as 'create-file' | 'update-file' | 'open-file',
          path: filePath,
        });
      }
    }

    return response;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  clearSession(): void {
    this.sessionId = null;
  }
}

export const aiIDE = new AIIDEIntegration();

// React hook for AI IDE integration
export function useAIIDE() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      try {
        await aiIDE.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI IDE:', error);
      }
    };
    init();
  }, []);

  const sendMessage = async (message: string, context?: AIIDEContext) => {
    setIsLoading(true);
    try {
      const response = await aiIDE.sendMessage(message, context);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const explainCode = async (code: string, language: string) => {
    setIsLoading(true);
    try {
      return await aiIDE.explainCode(code, language);
    } finally {
      setIsLoading(false);
    }
  };

  const fixCode = async (code: string, error: string, language: string) => {
    setIsLoading(true);
    try {
      return await aiIDE.fixCode(code, error, language);
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeCode = async (code: string, language: string) => {
    setIsLoading(true);
    try {
      return await aiIDE.optimizeCode(code, language);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async (prompt: string, language?: string) => {
    setIsLoading(true);
    try {
      return await aiIDE.generateCode(prompt, language);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInitialized,
    isLoading,
    sendMessage,
    explainCode,
    fixCode,
    optimizeCode,
    generateCode,
  };
}
