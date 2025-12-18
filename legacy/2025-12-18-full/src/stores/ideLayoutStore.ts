/**
 * File: src/stores/ideLayoutStore.ts
 * Purpose: Zustand store for IDE layout state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PanelId = 'files' | 'editor' | 'preview' | 'terminal' | 'aiChat';
export type LayoutPreset = 'default' | 'focus' | 'development' | 'review' | 'fullIde';

export interface PanelState {
  id: PanelId;
  visible: boolean;
  width?: number;
  height?: number;
  minimized: boolean;
  maximized: boolean;
  order: number;
}

export interface IDELayoutState {
  panels: Record<PanelId, PanelState>;
  activePreset: LayoutPreset;
  theme: 'light' | 'dark' | 'auto';
  
  // Actions
  togglePanel: (panelId: PanelId) => void;
  minimizePanel: (panelId: PanelId) => void;
  maximizePanel: (panelId: PanelId) => void;
  restorePanel: (panelId: PanelId) => void;
  setPanelSize: (panelId: PanelId, width?: number, height?: number) => void;
  applyPreset: (preset: LayoutPreset) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  resetLayout: () => void;
}

const defaultPanels: Record<PanelId, PanelState> = {
  files: { id: 'files', visible: true, width: 250, minimized: false, maximized: false, order: 0 },
  editor: { id: 'editor', visible: true, width: 700, height: 600, minimized: false, maximized: false, order: 1 },
  preview: { id: 'preview', visible: true, width: 450, minimized: false, maximized: false, order: 2 },
  terminal: { id: 'terminal', visible: true, height: 200, minimized: false, maximized: false, order: 3 },
  aiChat: { id: 'aiChat', visible: true, width: 400, minimized: false, maximized: false, order: 4 },
};

const presetConfigurations: Record<LayoutPreset, Partial<Record<PanelId, Partial<PanelState>>>> = {
  default: {
    files: { visible: true, minimized: false, maximized: false },
    editor: { visible: true, minimized: false, maximized: false },
    preview: { visible: true, minimized: false, maximized: false },
    terminal: { visible: true, minimized: false, maximized: false },
    aiChat: { visible: true, minimized: false, maximized: false },
  },
  focus: {
    files: { visible: false },
    editor: { visible: true, maximized: true },
    preview: { visible: false },
    terminal: { visible: false },
    aiChat: { visible: false },
  },
  development: {
    files: { visible: true },
    editor: { visible: true },
    preview: { visible: false },
    terminal: { visible: true },
    aiChat: { visible: false },
  },
  review: {
    files: { visible: false },
    editor: { visible: true },
    preview: { visible: true },
    terminal: { visible: false },
    aiChat: { visible: true },
  },
  fullIde: {
    files: { visible: true },
    editor: { visible: true },
    preview: { visible: true },
    terminal: { visible: true },
    aiChat: { visible: true },
  },
};

export const useIDELayoutStore = create<IDELayoutState>()(
  persist(
    (set) => ({
      panels: defaultPanels,
      activePreset: 'default',
      theme: 'auto',

      togglePanel: (panelId) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              visible: !state.panels[panelId].visible,
            },
          },
        })),

      minimizePanel: (panelId) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              minimized: true,
              maximized: false,
            },
          },
        })),

      maximizePanel: (panelId) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              minimized: false,
              maximized: true,
            },
          },
        })),

      restorePanel: (panelId) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              minimized: false,
              maximized: false,
            },
          },
        })),

      setPanelSize: (panelId, width, height) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              ...(width !== undefined && { width }),
              ...(height !== undefined && { height }),
            },
          },
        })),

      applyPreset: (preset) =>
        set((state) => {
          const presetConfig = presetConfigurations[preset];
          const updatedPanels = { ...state.panels };

          Object.keys(presetConfig).forEach((panelId) => {
            const panel = panelId as PanelId;
            updatedPanels[panel] = {
              ...updatedPanels[panel],
              ...presetConfig[panel],
            };
          });

          return {
            panels: updatedPanels,
            activePreset: preset,
          };
        }),

      setTheme: (theme) => set({ theme }),

      resetLayout: () =>
        set({
          panels: defaultPanels,
          activePreset: 'default',
        }),
    }),
    {
      name: 'ide-layout-storage',
    }
  )
);
