"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2 } from 'lucide-react';
import { CommandProcessor } from '@/ide/commandProcessor';
import { useFileSystem } from '@/ide/useFileSystem';

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
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { fs } = useFileSystem();

  const createSession = (title: string, index: number) => {
    if (!terminalRef.current || !fs) return null;

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

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    fitAddonRef.current = fitAddon;

    terminal.open(terminalRef.current);
    fitAddon.fit();

    const commandProcessor = new CommandProcessor(fs);
    const sessionId = `session-${Date.now()}-${index}`;

    // Welcome message
    if (index === 0) {
      terminal.writeln('\x1b[1;32m╔═══════════════════════════════════════════════╗\x1b[0m');
      terminal.writeln('\x1b[1;32m║     Welcome to ZacAi IDE Terminal            ║\x1b[0m');
      terminal.writeln('\x1b[1;32m╚═══════════════════════════════════════════════╝\x1b[0m');
      terminal.writeln('');
      terminal.writeln('\x1b[1;36mType "help" for available commands\x1b[0m');
      terminal.writeln('');
    }
    
    const session: TerminalSession = {
      id: sessionId,
      title,
      terminal,
      commandProcessor,
      currentLine: '',
      cursorPosition: 0,
    };

    // Show prompt
    terminal.write(commandProcessor.getPrompt());

    // Handle input
    terminal.onData(async (data: string) => {
      const charCode = data.charCodeAt(0);

      if (data === '\r') {
        // Enter key - execute command
        terminal.write('\r\n');
        
        if (session.currentLine.trim()) {
          const result = await commandProcessor.executeCommand(session.currentLine);
          
          // Handle special clear command
          if (result.output === '\x1bc') {
            terminal.clear();
          } else if (result.output) {
            terminal.write(result.output);
          }
        }
        
        session.currentLine = '';
        session.cursorPosition = 0;
        terminal.write(commandProcessor.getPrompt());
      } else if (data === '\u007F' || charCode === 8) {
        // Backspace
        if (session.cursorPosition > 0) {
          session.currentLine = 
            session.currentLine.slice(0, session.cursorPosition - 1) +
            session.currentLine.slice(session.cursorPosition);
          session.cursorPosition--;
          terminal.write('\b \b');
        }
      } else if (data === '\x1b[A') {
        // Up arrow - previous command
        const prevCommand = commandProcessor.getPreviousCommand();
        if (prevCommand) {
          // Clear current line
          terminal.write('\r' + commandProcessor.getPrompt());
          terminal.write(' '.repeat(session.currentLine.length));
          terminal.write('\r' + commandProcessor.getPrompt());
          
          // Write previous command
          terminal.write(prevCommand);
          session.currentLine = prevCommand;
          session.cursorPosition = prevCommand.length;
        }
      } else if (data === '\x1b[B') {
        // Down arrow - next command
        const nextCommand = commandProcessor.getNextCommand();
        if (nextCommand) {
          // Clear current line
          terminal.write('\r' + commandProcessor.getPrompt());
          terminal.write(' '.repeat(session.currentLine.length));
          terminal.write('\r' + commandProcessor.getPrompt());
          
          // Write next command
          terminal.write(nextCommand);
          session.currentLine = nextCommand;
          session.cursorPosition = nextCommand.length;
        }
      } else if (data === '\x1b[C') {
        // Right arrow
        if (session.cursorPosition < session.currentLine.length) {
          session.cursorPosition++;
          terminal.write(data);
        }
      } else if (data === '\x1b[D') {
        // Left arrow
        if (session.cursorPosition > 0) {
          session.cursorPosition--;
          terminal.write(data);
        }
      } else if (charCode >= 32 && charCode < 127) {
        // Printable character
        session.currentLine = 
          session.currentLine.slice(0, session.cursorPosition) +
          data +
          session.currentLine.slice(session.cursorPosition);
        session.cursorPosition++;
        terminal.write(data);
      }
    });

    return session;
  };

  useEffect(() => {
    if (!terminalRef.current || !fs) return;

    const session = createSession('Terminal 1', 0);
    if (session) {
      setSessions([session]);
      setActiveSessionId(session.id);
    }

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
      sessions.forEach((s) => s.terminal.dispose());
    };
  }, [fs]);

  const addSession = () => {
    const newSession = createSession(`Terminal ${sessions.length + 1}`, sessions.length);
    if (newSession) {
      setSessions([...sessions, newSession]);
      setActiveSessionId(newSession.id);
    }
  };

  const closeSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      session.terminal.dispose();
      const newSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(newSessions);
      
      if (activeSessionId === sessionId && newSessions.length > 0) {
        setActiveSessionId(newSessions[0].id);
      }
    }
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
