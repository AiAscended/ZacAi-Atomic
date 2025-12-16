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

export interface EditorState {
  openFiles: EditorTab[];
  activeFileId: string | null;

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
          openFiles: state.openFiles.map((file) =>
            file.id === fileId ? { ...file, content, isDirty: true } : file
          ),
        }));
      },

      markFileDirty: (fileId, isDirty) => {
        set((state) => ({
          openFiles: state.openFiles.map((file) =>
            file.id === fileId ? { ...file, isDirty } : file
          ),
        }));
      },

      updateCursorPosition: (fileId, line, column) => {
        set((state) => ({
          openFiles: state.openFiles.map((file) =>
            file.id === fileId
              ? { ...file, cursorPosition: { line, column } }
              : file
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
      name: 'zacai-editor-store',
      partialize: (state) => ({
        openFiles: state.openFiles.map((file) => ({
          ...file,
          content: '',
        })),
        activeFileId: state.activeFileId,
      }),
    }
  )
);
