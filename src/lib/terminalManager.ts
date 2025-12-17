/**
 * File: src/lib/terminalManager.ts
 * Purpose: Manage terminal sessions for dev console
 * Features: Spawn bash shells, manage WebSocket connections, cleanup on disconnect
 */

import type { RawData, WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import * as pty from 'node-pty';
import { logEvent } from './systemActivityLogger.cjs';

type TerminalControlMessage =
  | { type: 'input'; data: string }
  | { type: 'resize'; cols: number; rows: number };

type TerminalInitMessage = { type: 'init'; userId?: string };

const isTerminalControlMessage = (value: unknown): value is TerminalControlMessage => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payload = value as Record<string, unknown>;
  if (payload.type === 'input') {
    return typeof payload.data === 'string';
  }
  if (payload.type === 'resize') {
    return typeof payload.cols === 'number' && typeof payload.rows === 'number';
  }
  return false;
};

const isTerminalInitMessage = (value: unknown): value is TerminalInitMessage => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payload = value as Record<string, unknown>;
  return payload.type === 'init';
};

export interface TerminalSession {
  id: string;
  pty: pty.IPty;
  ws: WebSocket;
  userId?: string;
  createdAt: Date;
}

const terminals = new Map<string, TerminalSession>();

export function createTerminal(ws: WebSocket, userId?: string): string {
  const id = Math.random().toString(36).substring(7);
  
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  const terminal = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env as { [key: string]: string },
  });

  const session: TerminalSession = {
    id,
    pty: terminal,
    ws,
    userId,
    createdAt: new Date(),
  };

  terminals.set(id, session);

  terminal.onData((data: string) => {
    try {
      if (ws.readyState === 1) { // OPEN
        ws.send(JSON.stringify({ type: 'output', data }));
      }
    } catch (error) {
      console.error('Failed to send terminal data:', error);
    }
  });

  terminal.onExit(() => {
    terminals.delete(id);
    try {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'exit' }));
      }
    } catch (error) {
      console.error('Failed to send exit message:', error);
    }
  });

  ws.on('message', (message: RawData) => {
    try {
      const data = JSON.parse(message.toString());
      if (!isTerminalControlMessage(data)) {
        return;
      }
      if (data.type === 'input') {
        terminal.write(data.data);
      } else {
        terminal.resize(data.cols, data.rows);
      }
    } catch (error) {
      console.error('Failed to process terminal message:', error);
    }
  });

  ws.on('close', () => {
    terminal.kill();
    terminals.delete(id);
    logEvent('terminal', 'closed', { terminalId: id, userId });
  });

  logEvent('terminal', 'created', { terminalId: id, userId });

  return id;
}

export function getTerminal(id: string): TerminalSession | undefined {
  return terminals.get(id);
}

export function closeTerminal(id: string): void {
  const session = terminals.get(id);
  if (session) {
    session.pty.kill();
    terminals.delete(id);
    logEvent('terminal', 'closed', { terminalId: id });
  }
}

export function closeAllTerminals(): void {
  for (const [id, session] of terminals.entries()) {
    session.pty.kill();
    terminals.delete(id);
  }
  logEvent('terminal', 'all_closed', { count: terminals.size });
}

export function initializeWebSocketServer(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket) => {
    console.log('[Terminal] WebSocket connection established');
    
    ws.on('message', (message: RawData) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (isTerminalInitMessage(data)) {
          const terminalId = createTerminal(ws, data.userId);
          ws.send(JSON.stringify({ 
            type: 'ready', 
            terminalId,
            shell: process.platform === 'win32' ? 'powershell' : 'bash'
          }));
        }
      } catch (error) {
        console.error('[Terminal] Failed to process message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to initialize terminal'  
        }));
      }
    });

    ws.on('error', (error: Error) => {
      console.error('[Terminal] WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('[Terminal] WebSocket connection closed');
    });
  });

  console.log('[Terminal] WebSocket server initialized');
  logEvent('websocket', 'server_initialized', { service: 'terminal' });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Terminal] Shutting down gracefully...');
  closeAllTerminals();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Terminal] Shutting down gracefully...');
  closeAllTerminals();
  process.exit(0);
});

// Export terminal manager object for server.ts
export const terminalManager = {
  createTerminal,
  getTerminal,
  closeTerminal,
  closeAllTerminals,
  initializeWebSocketServer,
  initialize: async (server: Server) => {
    const ws = await import('ws');
    const wss = new ws.WebSocketServer({ server, path: '/terminal' });
    initializeWebSocketServer(wss);
    console.log('[Terminal] WebSocket server initialized on path /terminal');
  }
};

// Export all functions
export default terminalManager;
