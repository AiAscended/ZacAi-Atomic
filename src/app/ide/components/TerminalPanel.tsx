"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2 } from 'lucide-react';

interface TerminalSession {
  id: string;
  title: string;
  terminal: XTerm;
}

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize first terminal session
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selectionBackground: '#264f78',
      },
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    fitAddonRef.current = fitAddon;

    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Welcome message
    terminal.writeln('\x1b[1;32m╔═══════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[1;32m║     Welcome to ZacAi IDE Terminal            ║\x1b[0m');
    terminal.writeln('\x1b[1;32m╚═══════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    terminal.writeln('Phase 4: Full terminal integration coming soon!');
    terminal.writeln('');
    terminal.writeln('Features:');
    terminal.writeln('  • Command execution');
    terminal.writeln('  • Process management');
    terminal.writeln('  • Multiple terminal sessions');
    terminal.writeln('  • Shell environment');
    terminal.writeln('');
    terminal.write('\x1b[1;36m$\x1b[0m ');

    // Placeholder input handling (Phase 4 will add real command execution)
    terminal.onData((data: string) => {
      if (data === '\r') {
        terminal.writeln('');
        terminal.writeln('Command execution coming in Phase 4...');
        terminal.write('\x1b[1;36m$\x1b[0m ');
      } else {
        terminal.write(data);
      }
    });

    const sessionId = `session-${Date.now()}`;
    setSessions([{ id: sessionId, title: 'Terminal 1', terminal }]);
    setActiveSessionId(sessionId);

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  const addSession = () => {
    // Phase 4: Create new terminal session
    console.log('Add terminal session - Phase 4');
  };

  const closeSession = (sessionId: string) => {
    // Phase 4: Close terminal session
    console.log('Close session:', sessionId);
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
                ? 'bg-[#1e1e1e] text-white'
                : 'text-gray-400 hover:bg-[#2a2d2e]'
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
