/**
 * File: src/components/admin/dev-console/AdminTerminal.tsx
 * Purpose: xterm.js-based terminal for ZacAi dev console
 * Features: WebSocket connection, session management, status indicators
 */

"use client"

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import {
  Terminal as TerminalIcon,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminTerminalProps {
  className?: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function AdminTerminal({ className }: AdminTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
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
      scrollback: 1000,
      cols: 80,
      rows: 24,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Connect to WebSocket
    connectWebSocket();

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        
        // Send resize message to server
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            cols: xtermRef.current.cols,
            rows: xtermRef.current.rows,
          }));
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (!xtermRef.current) return;

    setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/admin/dev-console/terminal`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      xtermRef.current?.writeln('Connected to terminal...\r\n');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'session_id':
            setSessionId(data.id);
            break;

          case 'output':
            xtermRef.current?.write(data.data);
            break;

          case 'exit':
            xtermRef.current?.writeln(`\r\n\x1b[33mProcess exited with code ${data.exitCode}\x1b[0m\r\n`);
            setStatus('disconnected');
            break;

          case 'error':
            xtermRef.current?.writeln(`\r\n\x1b[31mError: ${data.message}\x1b[0m\r\n`);
            setStatus('error');
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
      xtermRef.current?.writeln('\r\n\x1b[31mWebSocket error occurred\x1b[0m\r\n');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      xtermRef.current?.writeln('\r\n\x1b[33mConnection closed\x1b[0m\r\n');
    };

    // Handle terminal input
    xtermRef.current.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'input',
          data,
        }));
      }
    });
  };

  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  const handleClear = () => {
    xtermRef.current?.clear();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-[#1e1e1e]', className)}>
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Terminal</span>
          {sessionId && (
            <span className="text-xs text-gray-500">({sessionId})</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs text-gray-400">{getStatusText()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              disabled={status !== 'connected'}
              title="Clear terminal"
            >
              <Trash2 className="w-3 h-3" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleReconnect}
              disabled={status === 'connecting' || status === 'connected'}
              title="Reconnect"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div ref={terminalRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
