import { useEffect, useCallback } from "react";

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch =
          shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
        const shiftMatch =
          shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch =
          shortcut.alt === undefined || shortcut.alt === event.altKey;
        const metaMatch =
          shortcut.meta === undefined || shortcut.meta === event.metaKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Common IDE shortcuts
export const createIDEShortcuts = (actions: {
  save?: () => void;
  saveAll?: () => void;
  closeTab?: () => void;
  newFile?: () => void;
  quickOpen?: () => void;
  findInFiles?: () => void;
  toggleTerminal?: () => void;
  toggleSidebar?: () => void;
  formatDocument?: () => void;
  goToLine?: () => void;
  commandPalette?: () => void;
}): KeyboardShortcut[] => {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  return [
    // File operations
    actions.save && {
      key: "s",
      [isMac ? "meta" : "ctrl"]: true,
      action: actions.save,
      description: "Save current file",
    },
    actions.saveAll && {
      key: "s",
      [isMac ? "meta" : "ctrl"]: true,
      shift: true,
      action: actions.saveAll,
      description: "Save all files",
    },
    actions.closeTab && {
      key: "w",
      [isMac ? "meta" : "ctrl"]: true,
      action: actions.closeTab,
      description: "Close current tab",
    },
    actions.newFile && {
      key: "n",
      [isMac ? "meta" : "ctrl"]: true,
      action: actions.newFile,
      description: "New file",
    },

    // Navigation
    actions.quickOpen && {
      key: "p",
      [isMac ? "meta" : "ctrl"]: true,
      action: actions.quickOpen,
      description: "Quick open file",
    },
    actions.findInFiles && {
      key: "f",
      [isMac ? "meta" : "ctrl"]: true,
      shift: true,
      action: actions.findInFiles,
      description: "Find in files",
    },
    actions.goToLine && {
      key: "g",
      [isMac ? "meta" : "ctrl"]: true,
      action: actions.goToLine,
      description: "Go to line",
    },

    // View
    actions.toggleTerminal && {
      key: "`",
      [isMac ? "meta" : "ctrl"]: true,
      action: actions.toggleTerminal,
      description: "Toggle terminal",
    },
    actions.toggleSidebar && {
      key: "b",
      [isMac ? "meta" : "ctrl"]: true,
      action: actions.toggleSidebar,
      description: "Toggle sidebar",
    },

    // Editing
    actions.formatDocument && {
      key: "f",
      [isMac ? "meta" : "ctrl"]: true,
      shift: true,
      alt: true,
      action: actions.formatDocument,
      description: "Format document",
    },

    // Command palette
    actions.commandPalette && {
      key: "p",
      [isMac ? "meta" : "ctrl"]: true,
      shift: true,
      action: actions.commandPalette,
      description: "Command palette",
    },
  ].filter(Boolean) as KeyboardShortcut[];
};

// Hook for command palette integration
export function useCommandPalette() {
  const commands = useCallback(() => {
    return [
      {
        id: "file.new",
        title: "New File",
        category: "File",
        shortcut: "Ctrl+N",
      },
      {
        id: "file.save",
        title: "Save",
        category: "File",
        shortcut: "Ctrl+S",
      },
      {
        id: "file.saveAll",
        title: "Save All",
        category: "File",
        shortcut: "Ctrl+Shift+S",
      },
      {
        id: "editor.format",
        title: "Format Document",
        category: "Editor",
        shortcut: "Ctrl+Shift+Alt+F",
      },
      {
        id: "view.toggleTerminal",
        title: "Toggle Terminal",
        category: "View",
        shortcut: "Ctrl+`",
      },
      {
        id: "view.toggleSidebar",
        title: "Toggle Sidebar",
        category: "View",
        shortcut: "Ctrl+B",
      },
      {
        id: "search.findInFiles",
        title: "Find in Files",
        category: "Search",
        shortcut: "Ctrl+Shift+F",
      },
      {
        id: "nav.quickOpen",
        title: "Quick Open",
        category: "Navigation",
        shortcut: "Ctrl+P",
      },
      {
        id: "nav.goToLine",
        title: "Go to Line",
        category: "Navigation",
        shortcut: "Ctrl+G",
      },
    ];
  }, []);

  return { commands };
}
