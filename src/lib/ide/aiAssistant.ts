/**
 * AI Assistant for IDE
 * Provides context-aware AI assistance for coding
 */

export interface IDEContext {
  currentFile?: {
    path: string;
    content: string;
    language: string;
    cursorPosition?: { line: number; column: number };
    selection?: string;
  };
  openFiles: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  projectFiles: string[];
  terminalOutput?: string;
  errors?: Array<{
    file: string;
    line: number;
    message: string;
  }>;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: Array<{
    language: string;
    code: string;
    filename?: string;
  }>;
  actions?: Array<{
    type: 'create' | 'update' | 'delete' | 'open';
    file: string;
    content?: string;
  }>;
}

export interface AIResponse {
  text: string;
  codeBlocks: Array<{
    language: string;
    code: string;
    filename?: string;
  }>;
  actions: Array<{
    type: 'create' | 'update' | 'delete' | 'open';
    file: string;
    content?: string;
  }>;
  domains: string[];
  confidence: number;
  metadata?: any;
}

export class AIAssistant {
  private sessionId: string | null = null;
  private apiEndpoint = '/api/chat';

  /**
   * Initialize AI session
   */
  async initialize(): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize AI session');
      }

      const data = await response.json();
      this.sessionId = data.sessionId;
      return this.sessionId;
    } catch (error) {
      console.error('AI initialization error:', error);
      throw error;
    }
  }

  /**
   * Send a message to the AI with IDE context
   */
  async sendMessage(message: string, context: IDEContext): Promise<AIResponse> {
    if (!this.sessionId) {
      await this.initialize();
    }

    try {
      // Enhance prompt with IDE context
      const enhancedPrompt = this.buildContextualPrompt(message, context);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: enhancedPrompt,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Parse response for code blocks and actions
      const codeBlocks = this.extractCodeBlocks(data.text);
      const actions = this.extractActions(data.text, context);

      return {
        text: data.text,
        codeBlocks,
        actions,
        domains: data.domains || [],
        confidence: data.confidence || 0,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('AI message error:', error);
      throw error;
    }
  }

  /**
   * Build a contextual prompt with IDE information
   */
  private buildContextualPrompt(message: string, context: IDEContext): string {
    let prompt = `[IDE Context]\n`;

    // Add current file context
    if (context.currentFile) {
      prompt += `Current File: ${context.currentFile.path}\n`;
      prompt += `Language: ${context.currentFile.language}\n`;
      
      if (context.currentFile.selection) {
        prompt += `\nSelected Code:\n\`\`\`${context.currentFile.language}\n${context.currentFile.selection}\n\`\`\`\n`;
      } else if (context.currentFile.content) {
        // Include first 100 lines or 5000 chars of current file
        const contentPreview = context.currentFile.content
          .split('\n')
          .slice(0, 100)
          .join('\n')
          .slice(0, 5000);
        prompt += `\nCurrent File Content:\n\`\`\`${context.currentFile.language}\n${contentPreview}\n\`\`\`\n`;
      }
    }

    // Add project files list
    if (context.projectFiles.length > 0) {
      prompt += `\nProject Files (${context.projectFiles.length}):\n`;
      prompt += context.projectFiles.slice(0, 20).join('\n');
      if (context.projectFiles.length > 20) {
        prompt += `\n... and ${context.projectFiles.length - 20} more files`;
      }
      prompt += '\n';
    }

    // Add errors if any
    if (context.errors && context.errors.length > 0) {
      prompt += `\nCurrent Errors:\n`;
      context.errors.forEach((error) => {
        prompt += `- ${error.file}:${error.line}: ${error.message}\n`;
      });
    }

    prompt += `\n[User Request]\n${message}\n`;

    return prompt;
  }

  /**
   * Extract code blocks from AI response
   */
  private extractCodeBlocks(text: string): Array<{
    language: string;
    code: string;
    filename?: string;
  }> {
    const codeBlocks: Array<{ language: string; code: string; filename?: string }> = [];
    
    // Match code blocks with language and optional filename
    const codeBlockRegex = /```(\w+)(?:\s+(.+?))?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [, language, filename, code] = match;
      codeBlocks.push({
        language: language || 'plaintext',
        code: code.trim(),
        filename: filename?.trim(),
      });
    }

    return codeBlocks;
  }

  /**
   * Extract file actions from AI response
   */
  private extractActions(
    text: string,
    context: IDEContext
  ): Array<{
    type: 'create' | 'update' | 'delete' | 'open';
    file: string;
    content?: string;
  }> {
    const actions: Array<{
      type: 'create' | 'update' | 'delete' | 'open';
      file: string;
      content?: string;
    }> = [];

    // Look for explicit action commands
    const actionPatterns = [
      /create file `([^`]+)`/gi,
      /update file `([^`]+)`/gi,
      /delete file `([^`]+)`/gi,
      /open file `([^`]+)`/gi,
    ];

    const codeBlocks = this.extractCodeBlocks(text);

    // If code blocks have filenames, suggest creating/updating them
    codeBlocks.forEach((block) => {
      if (block.filename) {
        const existsInProject = context.projectFiles.some((f) =>
          f.endsWith(block.filename!)
        );
        actions.push({
          type: existsInProject ? 'update' : 'create',
          file: block.filename,
          content: block.code,
        });
      }
    });

    return actions;
  }

  /**
   * Quick actions for common IDE tasks
   */
  async explainCode(code: string, language: string): Promise<AIResponse> {
    return this.sendMessage(`Explain this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``, {
      openFiles: [],
      projectFiles: [],
      currentFile: {
        path: 'selection',
        content: code,
        language,
      },
    });
  }

  async fixCode(code: string, language: string, error?: string): Promise<AIResponse> {
    const prompt = error
      ? `Fix this ${language} code that's producing the error: "${error}"\n\`\`\`${language}\n${code}\n\`\`\``
      : `Fix any issues in this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;
    
    return this.sendMessage(prompt, {
      openFiles: [],
      projectFiles: [],
      currentFile: {
        path: 'selection',
        content: code,
        language,
      },
    });
  }

  async optimizeCode(code: string, language: string): Promise<AIResponse> {
    return this.sendMessage(
      `Optimize this ${language} code for better performance and readability:\n\`\`\`${language}\n${code}\n\`\`\``,
      {
        openFiles: [],
        projectFiles: [],
        currentFile: {
          path: 'selection',
          content: code,
          language,
        },
      }
    );
  }

  async generateCode(description: string, language: string): Promise<AIResponse> {
    return this.sendMessage(`Generate ${language} code for: ${description}`, {
      openFiles: [],
      projectFiles: [],
      currentFile: {
        path: 'new-file',
        content: '',
        language,
      },
    });
  }

  async addDocumentation(code: string, language: string): Promise<AIResponse> {
    return this.sendMessage(
      `Add comprehensive documentation/comments to this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
      {
        openFiles: [],
        projectFiles: [],
        currentFile: {
          path: 'selection',
          content: code,
          language,
        },
      }
    );
  }

  async generateTests(code: string, language: string): Promise<AIResponse> {
    return this.sendMessage(
      `Generate unit tests for this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
      {
        openFiles: [],
        projectFiles: [],
        currentFile: {
          path: 'selection',
          content: code,
          language,
        },
      }
    );
  }

  async refactorCode(code: string, language: string, instructions: string): Promise<AIResponse> {
    return this.sendMessage(
      `Refactor this ${language} code: ${instructions}\n\`\`\`${language}\n${code}\n\`\`\``,
      {
        openFiles: [],
        projectFiles: [],
        currentFile: {
          path: 'selection',
          content: code,
          language,
        },
      }
    );
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Reset session
   */
  async resetSession(): Promise<void> {
    this.sessionId = null;
    await this.initialize();
  }
}

// Singleton instance
export const aiAssistant = new AIAssistant();
