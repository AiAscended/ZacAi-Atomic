import { create } from 'zustand';
import { useEditorStore } from './editorStore';
import { vfs } from './virtualFileSystem';

export interface AIContext {
  currentFile: string | null;
  currentCode: string;
  cursorPosition: { line: number; column: number } | null;
  selectedText: string | null;
  openFiles: string[];
  projectStructure: string[];
  recentChanges: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  context?: AIContext;
  codeBlocks?: Array<{
    language: string;
    code: string;
    filename?: string;
  }>;
}

interface AIIntegrationState {
  messages: AIMessage[];
  isGenerating: boolean;
  context: AIContext | null;
  
  // Actions
  sendMessage: (content: string, includeContext?: boolean) => Promise<void>;
  addMessage: (message: AIMessage) => void;
  clearMessages: () => void;
  updateContext: () => Promise<AIContext>;
  applyCodeSuggestion: (code: string, filename?: string) => Promise<void>;
  openCodeInEditor: (code: string, language: string, filename?: string) => Promise<void>;
}

export const useAIIntegration = create<AIIntegrationState>((set, get) => ({
  messages: [],
  isGenerating: false,
  context: null,

  updateContext: async () => {
    const editorStore = useEditorStore.getState();
    const activeTab = editorStore.getActiveTab();
    
    await vfs.init();
    const allFiles = await vfs.getDirectoryTree('/');
    
    const context: AIContext = {
      currentFile: activeTab?.path || null,
      currentCode: activeTab?.content || '',
      cursorPosition: activeTab?.cursorPosition || null,
      selectedText: null, // Will be updated from Monaco editor
      openFiles: editorStore.tabs.map(t => t.path),
      projectStructure: allFiles.map(f => f.path),
      recentChanges: editorStore.tabs
        .filter(t => t.isDirty)
        .map(t => t.path),
    };

    set({ context });
    return context;
  },

  sendMessage: async (content, includeContext = true) => {
    set({ isGenerating: true });

    try {
      // Update context before sending
      const context = includeContext ? await get().updateContext() : null;

      // Create user message
      const userMessage: AIMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
        context: context || undefined,
      };

      set(state => ({
        messages: [...state.messages, userMessage],
      }));

      // Prepare context for AI
      const contextPrompt = context ? `
        
IDE Context:
- Current file: ${context.currentFile || 'None'}
- Open files: ${context.openFiles.join(', ') || 'None'}
- Cursor position: ${context.cursorPosition ? `Line ${context.cursorPosition.line}, Col ${context.cursorPosition.column}` : 'N/A'}
- Unsaved changes: ${context.recentChanges.length} file(s)

${context.currentCode ? `Current code:\n\`\`\`\n${context.currentCode.slice(0, 1000)}${context.currentCode.length > 1000 ? '\n... (truncated)' : ''}\n\`\`\`` : ''}
` : '';

      // Call ZacAi API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content + contextPrompt,
          action: 'chat',
          sessionId: 'ide-session',
          domain: 'programming',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Extract code blocks from response
      const codeBlocks = extractCodeBlocks(data.response || data.message || '');

      // Create assistant message
      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: data.response || data.message || 'No response',
        timestamp: Date.now(),
        codeBlocks,
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isGenerating: false,
      }));
    } catch (error) {
      console.error('AI Integration Error:', error);
      
      const errorMessage: AIMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };

      set(state => ({
        messages: [...state.messages, errorMessage],
        isGenerating: false,
      }));
    }
  },

  addMessage: (message) => {
    set(state => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  applyCodeSuggestion: async (code, filename) => {
    const editorStore = useEditorStore.getState();
    const activeTab = editorStore.getActiveTab();

    if (!activeTab && !filename) {
      throw new Error('No active file to apply suggestion');
    }

    const targetPath = filename || activeTab!.path;
    
    // Update file content
    await vfs.writeFile(targetPath, code);
    
    // Update editor tab
    editorStore.updateTabContent(activeTab!.id, code);
  },

  openCodeInEditor: async (code, language, filename) => {
    const editorStore = useEditorStore.getState();
    
    // Determine filename
    const ext = getExtensionForLanguage(language);
    const finalFilename = filename || `/untitled-${Date.now()}.${ext}`;
    
    // Create file in VFS
    await vfs.init();
    const exists = await vfs.readFile(finalFilename);
    
    if (!exists) {
      await vfs.createFile(finalFilename, code);
    } else {
      await vfs.writeFile(finalFilename, code);
    }

    // Open in editor
    const title = finalFilename.split('/').pop() || finalFilename;
    editorStore.openFile(finalFilename, title, code, language);
  },
}));

// Helper function to extract code blocks from markdown
function extractCodeBlocks(text: string): Array<{ language: string; code: string; filename?: string }> {
  const codeBlockRegex = /```(\w+)(?:\s+(.+?))?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string; filename?: string }> = [];
  
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'plaintext',
      code: match[3].trim(),
      filename: match[2]?.trim(),
    });
  }
  
  return blocks;
}

// Helper function to get file extension for language
function getExtensionForLanguage(language: string): string {
  const map: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    markdown: 'md',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rs',
    sql: 'sql',
  };
  
  return map[language.toLowerCase()] || 'txt';
}

// Hook for inline AI suggestions
export function useInlineAI() {
  const aiIntegration = useAIIntegration();
  
  const getSuggestion = async (prompt: string) => {
    await aiIntegration.updateContext();
    return aiIntegration.sendMessage(`Inline suggestion: ${prompt}`, true);
  };

  const refactorCode = async (code: string, instruction: string) => {
    return aiIntegration.sendMessage(
      `Refactor this code: ${instruction}\n\n\`\`\`\n${code}\n\`\`\``,
      false
    );
  };

  const explainCode = async (code: string) => {
    return aiIntegration.sendMessage(
      `Explain this code:\n\n\`\`\`\n${code}\n\`\`\``,
      false
    );
  };

  const fixError = async (code: string, error: string) => {
    return aiIntegration.sendMessage(
      `Fix this error:\nError: ${error}\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
      false
    );
  };

  const generateTests = async (code: string) => {
    return aiIntegration.sendMessage(
      `Generate unit tests for this code:\n\n\`\`\`\n${code}\n\`\`\``,
      false
    );
  };

  const completeCode = async (code: string, cursorPosition: number) => {
    const before = code.slice(0, cursorPosition);
    const after = code.slice(cursorPosition);
    
    return aiIntegration.sendMessage(
      `Complete this code at cursor position:\n\n\`\`\`\n${before}█${after}\n\`\`\``,
      false
    );
  };

  return {
    getSuggestion,
    refactorCode,
    explainCode,
    fixError,
    generateTests,
    completeCode,
  };
}
