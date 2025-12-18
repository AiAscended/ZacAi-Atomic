import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IDESettings {
  // Editor settings
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    insertSpaces: boolean;
    wordWrap: "on" | "off" | "wordWrapColumn" | "bounded";
    lineNumbers: "on" | "off" | "relative";
    minimap: boolean;
    bracketPairColorization: boolean;
    formatOnSave: boolean;
    formatOnPaste: boolean;
  };

  // Theme settings
  theme: {
    editorTheme: "vs-dark" | "vs-light" | "hc-black";
    uiTheme: "dark" | "light" | "system";
  };

  // Terminal settings
  terminal: {
    fontSize: number;
    fontFamily: string;
    cursorBlink: boolean;
    scrollback: number;
  };

  // AI Assistant settings
  ai: {
    enabled: boolean;
    autoSuggest: boolean;
    contextLines: number;
    showInlineHints: boolean;
  };

  // File settings
  files: {
    autoSave: "off" | "afterDelay" | "onFocusChange" | "onWindowChange";
    autoSaveDelay: number;
    exclude: string[];
    watcherExclude: string[];
  };

  // Git settings
  git: {
    enabled: boolean;
    autoFetch: boolean;
    autoPull: boolean;
    confirmSync: boolean;
  };

  // Preview settings
  preview: {
    autoRefresh: boolean;
    refreshDelay: number;
    openDevTools: boolean;
  };

  // Keyboard shortcuts
  keybindings: {
    [key: string]: string;
  };
}

const defaultSettings: IDESettings = {
  editor: {
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "off",
    lineNumbers: "on",
    minimap: true,
    bracketPairColorization: true,
    formatOnSave: true,
    formatOnPaste: true,
  },
  theme: {
    editorTheme: "vs-dark",
    uiTheme: "dark",
  },
  terminal: {
    fontSize: 14,
    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
    cursorBlink: true,
    scrollback: 1000,
  },
  ai: {
    enabled: true,
    autoSuggest: true,
    contextLines: 50,
    showInlineHints: true,
  },
  files: {
    autoSave: "afterDelay",
    autoSaveDelay: 1000,
    exclude: ["node_modules", ".git", "dist", "build"],
    watcherExclude: ["node_modules/**", ".git/**"],
  },
  git: {
    enabled: true,
    autoFetch: true,
    autoPull: false,
    confirmSync: true,
  },
  preview: {
    autoRefresh: true,
    refreshDelay: 500,
    openDevTools: false,
  },
  keybindings: {
    save: "Ctrl+S",
    saveAll: "Ctrl+Shift+S",
    quickOpen: "Ctrl+P",
    commandPalette: "Ctrl+Shift+P",
    toggleTerminal: "Ctrl+`",
    toggleSidebar: "Ctrl+B",
    formatDocument: "Shift+Alt+F",
    find: "Ctrl+F",
    replace: "Ctrl+H",
    goToLine: "Ctrl+G",
  },
};

interface IDESettingsStore {
  settings: IDESettings;
  updateSettings: (updates: Partial<IDESettings>) => void;
  updateEditorSettings: (updates: Partial<IDESettings["editor"]>) => void;
  updateThemeSettings: (updates: Partial<IDESettings["theme"]>) => void;
  updateTerminalSettings: (updates: Partial<IDESettings["terminal"]>) => void;
  updateAISettings: (updates: Partial<IDESettings["ai"]>) => void;
  updateFileSettings: (updates: Partial<IDESettings["files"]>) => void;
  updateGitSettings: (updates: Partial<IDESettings["git"]>) => void;
  updatePreviewSettings: (updates: Partial<IDESettings["preview"]>) => void;
  updateKeybinding: (action: string, binding: string) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

export const useIDESettings = create<IDESettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      updateEditorSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            editor: { ...state.settings.editor, ...updates },
          },
        }));
      },

      updateThemeSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, ...updates },
          },
        }));
      },

      updateTerminalSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            terminal: { ...state.settings.terminal, ...updates },
          },
        }));
      },

      updateAISettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ai: { ...state.settings.ai, ...updates },
          },
        }));
      },

      updateFileSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            files: { ...state.settings.files, ...updates },
          },
        }));
      },

      updateGitSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            git: { ...state.settings.git, ...updates },
          },
        }));
      },

      updatePreviewSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            preview: { ...state.settings.preview, ...updates },
          },
        }));
      },

      updateKeybinding: (action, binding) => {
        set((state) => ({
          settings: {
            ...state.settings,
            keybindings: {
              ...state.settings.keybindings,
              [action]: binding,
            },
          },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2);
      },

      importSettings: (json) => {
        try {
          const parsed = JSON.parse(json);
          set({ settings: { ...defaultSettings, ...parsed } });
          return true;
        } catch (error) {
          console.error("Failed to import settings:", error);
          return false;
        }
      },
    }),
    {
      name: "zacai-ide-settings",
    },
  ),
);
