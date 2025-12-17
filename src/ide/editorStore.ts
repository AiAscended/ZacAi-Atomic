import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorTab {
  id: string;
  path: string;
  title: string;
  content: string;
  language: string;
  isDirty: boolean;
  cursorPosition?: { line: number; column: number };
}

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  openFiles: EditorTab[];
  activeFileId: string | null;
  
  // Actions
  openFile: (path: string, title: string, content: string, language: string) => void;
  closeFile: (fileId: string) => void;
  closeAllFiles: () => void;
  closeOtherFiles: (fileId: string) => void;
  setActiveFile: (fileId: string | null) => void;
  updateFileContent: (fileId: string, content: string) => void;
  markFileDirty: (fileId: string, isDirty: boolean) => void;
  updateCursorPosition: (fileId: string, line: number, column: number) => void;
  getFileById: (fileId: string | null | undefined) => EditorTab | undefined;
  getActiveFile: () => EditorTab | undefined;
  hasUnsavedChanges: () => boolean;

  // Legacy aliases for IDE components
  closeFile: (tabId: string) => void;
  setActiveFile: (tabId: string) => void;
  updateFileContent: (tabId: string, content: string) => void;
  saveFile: (tabId: string, fs: { write: (path: string, content: string) => Promise<void> }) => Promise<void>;
  getFileById: (tabId: string | null) => EditorTab | undefined;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      openFiles: [],
      activeFileId: null,

      openFile: (path, title, content, language) => {
        const state = get();
        
        // Check if file is already open
        const existingTab = state.tabs.find((tab) => tab.path === path);
        if (existingTab) {
          set({ activeTabId: existingTab.id, activeFileId: existingTab.id });
          return;
        }

        // Create new tab entry
        const newFile: EditorTab = {
          id: `tab-${Date.now()}-${Math.random()}`,
          path,
          title,
          content,
          language,
          isDirty: false,
        };

        const newTabs = [...state.tabs, newTab];

        set({
          tabs: newTabs,
          openFiles: newTabs,
          activeTabId: newTab.id,
          activeFileId: newTab.id,
        });
      },

      closeFile: (fileId) => {
        const state = get();
        const fileIndex = state.openFiles.findIndex((file) => file.id === fileId);
        const updatedFiles = state.openFiles.filter((file) => file.id !== fileId);

        let nextActiveId = state.activeFileId;
        if (state.activeFileId === fileId && updatedFiles.length > 0) {
          const nextIndex = Math.min(fileIndex, updatedFiles.length - 1);
          nextActiveId = updatedFiles[nextIndex].id;
        } else if (updatedFiles.length === 0) {
          nextActiveId = null;
        }

        set({
          tabs: newTabs,
          openFiles: newTabs,
          activeTabId: newActiveTabId,
          activeFileId: newActiveTabId,
        });
      },

      closeAllTabs: () => {
        set({ tabs: [], openFiles: [], activeTabId: null, activeFileId: null });
      },

      closeOtherFiles: (fileId) => {
        const state = get();
        const target = state.openFiles.find((file) => file.id === fileId);
        if (target) {
          set({
            tabs: [tab],
            openFiles: [tab],
            activeTabId: tab.id,
            activeFileId: tab.id,
          });
        }
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId, activeFileId: tabId });
      },

      updateTabContent: (tabId, content) => {
        set((state) => {
          const updatedTabs = state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, content, isDirty: true } : tab
          );
          return {
            tabs: updatedTabs,
            openFiles: updatedTabs,
          };
        });
      },

      markTabDirty: (tabId, isDirty) => {
        set((state) => {
          const updatedTabs = state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, isDirty } : tab
          );
          return {
            tabs: updatedTabs,
            openFiles: updatedTabs,
          };
        });
      },

      updateCursorPosition: (tabId, line, column) => {
        set((state) => {
          const updatedTabs = state.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, cursorPosition: { line, column } }
              : tab
          );
          return {
            tabs: updatedTabs,
            openFiles: updatedTabs,
          };
        });
      },

      getFileById: (fileId) => {
        if (!fileId) return undefined;
        return get().openFiles.find((file) => file.id === fileId);
      },

      getActiveFile: () => {
        const state = get();
        if (!state.activeFileId) return undefined;
        return state.openFiles.find((file) => file.id === state.activeFileId);
      },

      hasUnsavedChanges: () => {
        return get().openFiles.some((file) => file.isDirty);
      },

      closeFile: (tabId) => {
        get().closeTab(tabId);
      },

      setActiveFile: (tabId) => {
        get().setActiveTab(tabId);
      },

      updateFileContent: (tabId, content) => {
        get().updateTabContent(tabId, content);
      },

      saveFile: async (tabId, fs) => {
        const tab = get().tabs.find((t) => t.id === tabId);
        if (!tab) return;

        await fs.write(tab.path, tab.content);

        set((state) => {
          const updatedTabs = state.tabs.map((t) =>
            t.id === tabId ? { ...t, isDirty: false } : t
          );
          return {
            tabs: updatedTabs,
            openFiles: updatedTabs,
          };
        });
      },

      getFileById: (tabId) => {
        if (!tabId) return undefined;
        return get().tabs.find((tab) => tab.id === tabId);
      },
    }),
    {
      name: 'zacai-editor-store',
      partialize: (state) => ({
        openFiles: state.openFiles.map((file) => ({
          ...file,
          content: '',
        })),
        openFiles: state.openFiles.map(tab => ({
          ...tab,
          content: '',
        })),
        activeTabId: state.activeTabId,
        activeFileId: state.activeFileId,
      }),
    }
  )
);
