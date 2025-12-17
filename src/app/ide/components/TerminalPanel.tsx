"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { commandProcessor } from "@/lib/ide/commandProcessor";

// Type imports (types are safe during SSR)
import type { Terminal as XTermType } from "xterm";
import type { FitAddon as FitAddonType } from "xterm-addon-fit";

interface TerminalSession {
  id: string;
  title: string;
  terminal: XTerm;
  commandProcessor: CommandProcessor;
  currentLine: string;
  cursorPosition: number;
}

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const sessionsRef = useRef<TerminalSession[]>([]);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { fs } = useFileSystem();

  useEffect(() => {
    if (!terminalRef.current || typeof window === "undefined") return;

    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      scrollback: 10000,
      convertEol: true,
    });

    // Dynamic import xterm modules
    Promise.all([
      import("xterm"),
      import("xterm-addon-fit"),
      import("xterm-addon-web-links"),
    ])
      .then(([{ Terminal }, { FitAddon }, { WebLinksAddon }]) => {
        if (!terminalRef.current) return;

        setIsLoaded(true);

        // Initialize first terminal session
        terminal = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          theme: {
            background: "#1e1e1e",
            foreground: "#d4d4d4",
            cursor: "#ffffff",
            selectionBackground: "#264f78",
          },
          scrollback: 1000,
        });

        fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);
        fitAddonRef.current = fitAddon;

        terminal.open(terminalRef.current);
        fitAddon.fit();

        // Welcome message
        terminal.writeln(
          "\x1b[1;32m╔═══════════════════════════════════════════════╗\x1b[0m",
        );
        terminal.writeln(
          "\x1b[1;32m║     Welcome to ZacAi IDE Terminal            ║\x1b[0m",
        );
        terminal.writeln(
          "\x1b[1;32m╚═══════════════════════════════════════════════╝\x1b[0m",
        );
        terminal.writeln("");
        terminal.writeln(
          "Type \x1b[1;33mhelp\x1b[0m to see available commands",
        );
        terminal.writeln("");

        const prompt = () => {
          const cwd = commandProcessor.getCurrentDirectory();
          terminal.write(`\x1b[1;32m${cwd}\x1b[0m \x1b[1;36m$\x1b[0m `);
        };

        prompt();

        // Command execution with full shell support
        let currentLine = "";
        let historyIndex = -1;
        const history = commandProcessor.getHistory();

        terminal.onData(async (data: string) => {
          const code = data.charCodeAt(0);

          // Handle special keys
          if (code === 13) {
            // Enter
            terminal.writeln("");

            if (currentLine.trim()) {
              const result = await commandProcessor.executeCommand(currentLine);

              if (result.output) {
                terminal.write(result.output);
              }

              if (result.error) {
                terminal.writeln(`\x1b[1;31m${result.error}\x1b[0m`);
              }
            }

            currentLine = "";
            historyIndex = -1;
            prompt();
          } else if (code === 127) {
            // Backspace
            if (currentLine.length > 0) {
              currentLine = currentLine.slice(0, -1);
              terminal.write("\b \b");
            }
          } else if (code === 27) {
            // Escape sequences (arrow keys)
            // Handle arrow key navigation for history
            return;
          } else if (code === 3) {
            // Ctrl+C
            terminal.writeln("^C");
            currentLine = "";
            prompt();
          } else if (code === 12) {
            // Ctrl+L (clear)
            terminal.clear();
            prompt();
          } else if (data >= String.fromCharCode(32)) {
            // Printable characters
            currentLine += data;
            terminal.write(data);
          }
        });

        const sessionId = `session-${Date.now()}`;
        setSessions([{ id: sessionId, title: "Terminal 1", terminal }]);
        setActiveSessionId(sessionId);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
          if (fitAddon) {
            fitAddon.fit();
          }
        });

        if (terminalRef.current) {
          resizeObserver.observe(terminalRef.current);
        }

        cleanup = () => {
          resizeObserver.disconnect();
          terminal.dispose();
        };
      })
      .catch((error) => {
        console.error("Failed to load xterm:", error);
      });

    return () => {
      resizeObserver.disconnect();
      sessions.forEach((s) => s.terminal.dispose());
    };
  }, [fs]);

  const addSession = () => {
    // Phase 4: Create new terminal session
    console.log("Add terminal session - Phase 4");
  };

  const closeSession = (sessionId: string) => {
    // Phase 4: Close terminal session
    console.log("Close session:", sessionId);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Terminal Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#252526] border-b border-[#3e3e42]">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-sm cursor-pointer transition-colors ${
              session.id === activeSessionId
                ? "bg-[#1e1e1e] text-white"
                : "text-gray-400 hover:bg-[#2a2d2e]"
            }`}
            onClick={() => setActiveSessionId(session.id)}
          >
            <span>{session.title}</span>
            <button
              className="hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                closeSession(session.id);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={addSession}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Terminal Container */}
      <div ref={terminalRef} className="flex-1 p-2 overflow-hidden" />

      <div className="px-2 py-1 border-t border-[#3e3e42] bg-[#252526]">
        <p className="text-xs text-gray-500">
          Phase 4: WebAssembly shell integration
        </p>
      </div>
    </div>
  );
}

const toEntry = (file: IDEFile): CommandFileSystemEntry => ({
  name: file.path === '/' ? '/' : file.path.split('/').pop() || file.path,
  path: file.path,
  type: file.type,
  metadata: {
    size: file.size,
    modified: file.updatedAt,
  },
});

const createCommandFileSystem = (): CommandFileSystem => ({
  async read(path: string) {
    const file = await vfs.readFile(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    if (file.type === 'directory') {
      throw new Error(`${path} is a directory`);
    }
    return file.content;
  },
  async write(path: string, content: string) {
    await vfs.writeFile(path, content);
  },
  async mkdir(path: string) {
    await vfs.createDirectory(path);
  },
  async delete(path: string) {
    await vfs.deleteFile(path);
  },
  async list(path: string) {
    const targetPath = path || '/';
    const node = await vfs.readFile(targetPath);
    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }
    if (node.type === 'file') {
      return [toEntry(node)];
    }
    const children = await vfs.listDirectory(targetPath);
    return children.map(toEntry);
  },
  async exists(path: string) {
    const file = await vfs.readFile(path);
    return Boolean(file);
  },
  async search(query: string) {
    const results = await vfs.searchFiles(query);
    return results.map(toEntry);
  },
});
