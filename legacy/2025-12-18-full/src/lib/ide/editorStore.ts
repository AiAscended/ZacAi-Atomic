import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // Actions
  openFile: (
    path: string,
    title: string,
    content: string,
    language: string,
  ) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  updateCursorPosition: (tabId: string, line: number, column: number) => void;
  getTab: (tabId: string) => EditorTab | undefined;
  getActiveTab: () => EditorTab | undefined;
  hasUnsavedChanges: () => boolean;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      openFiles: [],
      activeFileId: null,

      openFile: (path, title, content, language) => {
        const state = get();

        // Check if file is already open
        const existingFile = state.openFiles.find((file) => file.path === path);
        if (existingFile) {
          set({ activeFileId: existingFile.id });
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

        set({
          openFiles: [...state.openFiles, newFile],
          activeFileId: newFile.id,
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
          openFiles: updatedFiles,
          activeFileId: nextActiveId,
        });
      },

      closeAllFiles: () => {
        set({ openFiles: [], activeFileId: null });
      },

      closeOtherFiles: (fileId) => {
        const state = get();
        const target = state.openFiles.find((file) => file.id === fileId);
        if (target) {
          set({
            openFiles: [target],
            activeFileId: target.id,
          });
        }
      },

      setActiveFile: (fileId) => {
        set({ activeFileId: fileId });
      },

      updateFileContent: (fileId, content) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, content, isDirty: true } : tab,
          ),
        }));
      },

      markFileDirty: (fileId, isDirty) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, isDirty } : tab,
          ),
        }));
      },

      updateCursorPosition: (fileId, line, column) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, cursorPosition: { line, column } }
              : tab,
          ),
        }));
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
    }),
    {
      name: "zacai-editor-store",
      partialize: (state) => ({
        tabs: state.tabs.map((tab) => ({
          ...tab,
          content: "", // Don't persist content to avoid localStorage quota
        })),
        activeFileId: state.activeFileId,
      }),
    },
  ),
);
