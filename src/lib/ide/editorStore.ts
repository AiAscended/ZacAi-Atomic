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
      tabs: [],
      activeTabId: null,

      openFile: (path, title, content, language) => {
        const state = get();

        // Check if file is already open
        const existingTab = state.tabs.find((tab) => tab.path === path);
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }

        // Create new tab
        const newTab: EditorTab = {
          id: `tab-${Date.now()}-${Math.random()}`,
          path,
          title,
          content,
          language,
          isDirty: false,
        };

        set({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        });
      },

      closeTab: (tabId) => {
        const state = get();
        const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
        const newTabs = state.tabs.filter((tab) => tab.id !== tabId);

        let newActiveTabId = state.activeTabId;
        if (state.activeTabId === tabId && newTabs.length > 0) {
          // Set active tab to the next tab, or previous if closing the last tab
          const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newActiveIndex].id;
        } else if (newTabs.length === 0) {
          newActiveTabId = null;
        }

        set({
          tabs: newTabs,
          activeTabId: newActiveTabId,
        });
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null });
      },

      closeOtherTabs: (tabId) => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === tabId);
        if (tab) {
          set({
            tabs: [tab],
            activeTabId: tab.id,
          });
        }
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId });
      },

      updateTabContent: (tabId, content) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, content, isDirty: true } : tab,
          ),
        }));
      },

      markTabDirty: (tabId, isDirty) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, isDirty } : tab,
          ),
        }));
      },

      updateCursorPosition: (tabId, line, column) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, cursorPosition: { line, column } }
              : tab,
          ),
        }));
      },

      getTab: (tabId) => {
        return get().tabs.find((tab) => tab.id === tabId);
      },

      getActiveTab: () => {
        const state = get();
        if (!state.activeTabId) return undefined;
        return state.tabs.find((tab) => tab.id === state.activeTabId);
      },

      hasUnsavedChanges: () => {
        return get().tabs.some((tab) => tab.isDirty);
      },
    }),
    {
      name: "zacai-editor-store",
      partialize: (state) => ({
        tabs: state.tabs.map((tab) => ({
          ...tab,
          content: "", // Don't persist content to avoid localStorage quota
        })),
        activeTabId: state.activeTabId,
      }),
    },
  ),
);
