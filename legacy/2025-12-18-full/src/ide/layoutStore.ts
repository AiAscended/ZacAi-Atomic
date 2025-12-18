import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PanelState {
  visible: boolean;
  size: number; // percentage
  minimized: boolean;
  maximized: boolean;
}

export interface LayoutState {
  files: PanelState;
  editor: PanelState;
  preview: PanelState;
  terminal: PanelState;
  aiChat: PanelState;
  currentLayout: string;

  // Actions
  togglePanel: (
    panel: keyof Omit<
      LayoutState,
      | "currentLayout"
      | "togglePanel"
      | "resizePanel"
      | "minimizePanel"
      | "maximizePanel"
      | "restorePanel"
      | "setLayout"
      | "resetLayout"
    >,
  ) => void;
  resizePanel: (
    panel: keyof Omit<
      LayoutState,
      | "currentLayout"
      | "togglePanel"
      | "resizePanel"
      | "minimizePanel"
      | "maximizePanel"
      | "restorePanel"
      | "setLayout"
      | "resetLayout"
    >,
    size: number,
  ) => void;
  minimizePanel: (
    panel: keyof Omit<
      LayoutState,
      | "currentLayout"
      | "togglePanel"
      | "resizePanel"
      | "minimizePanel"
      | "maximizePanel"
      | "restorePanel"
      | "setLayout"
      | "resetLayout"
    >,
  ) => void;
  maximizePanel: (
    panel: keyof Omit<
      LayoutState,
      | "currentLayout"
      | "togglePanel"
      | "resizePanel"
      | "minimizePanel"
      | "maximizePanel"
      | "restorePanel"
      | "setLayout"
      | "resetLayout"
    >,
  ) => void;
  restorePanel: (
    panel: keyof Omit<
      LayoutState,
      | "currentLayout"
      | "togglePanel"
      | "resizePanel"
      | "minimizePanel"
      | "maximizePanel"
      | "restorePanel"
      | "setLayout"
      | "resetLayout"
    >,
  ) => void;
  setLayout: (layout: string) => void;
  resetLayout: () => void;
}

const defaultPanelState: PanelState = {
  visible: true,
  size: 25,
  minimized: false,
  maximized: false,
};

const defaultState = {
  files: { ...defaultPanelState, size: 15 },
  editor: { ...defaultPanelState, size: 40 },
  preview: { ...defaultPanelState, size: 25 },
  terminal: { ...defaultPanelState, size: 10, visible: true },
  aiChat: { ...defaultPanelState, size: 20 },
  currentLayout: "default",
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      ...defaultState,

      togglePanel: (panel) =>
        set((state) => ({
          [panel]: {
            ...state[panel],
            visible: !state[panel].visible,
          },
        })),

      resizePanel: (panel, size) =>
        set((state) => ({
          [panel]: {
            ...state[panel],
            size: Math.max(5, Math.min(80, size)),
          },
        })),

      minimizePanel: (panel) =>
        set((state) => ({
          [panel]: {
            ...state[panel],
            minimized: true,
            maximized: false,
          },
        })),

      maximizePanel: (panel) =>
        set((state) => ({
          [panel]: {
            ...state[panel],
            minimized: false,
            maximized: true,
          },
        })),

      restorePanel: (panel) =>
        set((state) => ({
          [panel]: {
            ...state[panel],
            minimized: false,
            maximized: false,
          },
        })),

      setLayout: (layout) => {
        const layouts = {
          default: defaultState,
          focus: {
            ...defaultState,
            files: { ...defaultState.files, visible: false },
            preview: { ...defaultState.preview, visible: false },
            aiChat: { ...defaultState.aiChat, visible: false },
            terminal: { ...defaultState.terminal, visible: false },
            editor: { ...defaultState.editor, size: 100 },
          },
          development: {
            ...defaultState,
            preview: { ...defaultState.preview, visible: false },
            files: { ...defaultState.files, size: 20 },
            editor: { ...defaultState.editor, size: 50 },
            terminal: { ...defaultState.terminal, size: 15 },
            aiChat: { ...defaultState.aiChat, size: 15 },
          },
          review: {
            ...defaultState,
            files: { ...defaultState.files, visible: false },
            terminal: { ...defaultState.terminal, visible: false },
            editor: { ...defaultState.editor, size: 40 },
            preview: { ...defaultState.preview, size: 35 },
            aiChat: { ...defaultState.aiChat, size: 25 },
          },
        };

        set({
          ...layouts[layout as keyof typeof layouts],
          currentLayout: layout,
        });
      },

      resetLayout: () => set(defaultState),
    }),
    {
      name: "zacai-ide-layout",
    },
  ),
);
