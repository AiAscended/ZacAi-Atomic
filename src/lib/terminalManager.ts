/**
 * File: src/lib/terminalManager.ts
 * Purpose: Manage terminal sessions for dev console
 * Features: Spawn bash shells, manage WebSocket connections, cleanup on disconnect
 */

import { Server as WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import { logEvent } from './systemActivityLogger';

export interface TerminalSession {
  id: string;
  pty: pty.IPty;
  ws: WebSocket;
  userId?: string;
  created: Date;
}

class TerminalManager {
  private sessions: Map<string, TerminalSession> = new Map();
  private wss: WebSocketServer | null = null;

  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/admin/dev-console/terminal'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    logEvent('terminal_manager.initialized', {
      path: '/api/admin/dev-console/terminal'
    });
  }

  private handleConnection(ws: WebSocket, request: any) {
    const sessionId = this.generateSessionId();
    
    // TODO: Extract user from request/session
    const userId = 'admin'; // Placeholder

    logEvent('terminal_manager.connection_opened', {
      sessionId,
      userId,
      ip: request.socket.remoteAddress,
    });

    try {
      // Get shell and working directory
      const shell = process.env.SHELL || 'bash';
      const cwd = process.env.ZACAI_CODE_ROOT || process.cwd();

      // Spawn PTY
      const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
        },
      });

      const session: TerminalSession = {
        id: sessionId,
        pty: ptyProcess,
        ws,
        userId,
        created: new Date(),
      };

      this.sessions.set(sessionId, session);

      // Send session ID to client
      ws.send(JSON.stringify({ type: 'session_id', id: sessionId }));

      // Forward PTY output to WebSocket
      ptyProcess.onData((data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'output', data }));
        }
      });

      // Handle PTY exit
      ptyProcess.onExit(({ exitCode, signal }) => {
        logEvent('terminal_manager.pty_exited', {
          sessionId,
          exitCode,
          signal,
        });
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'exit', 
            exitCode, 
            signal 
          }));
          ws.close();
        }
        
        this.sessions.delete(sessionId);
      });

      // Handle WebSocket messages (stdin)
      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'input') {
            ptyProcess.write(data.data);
          } else if (data.type === 'resize') {
            ptyProcess.resize(data.cols || 80, data.rows || 24);
          }
        } catch (error) {
          console.error('[TerminalManager] Error handling message:', error);
        }
      });

      // Handle WebSocket close
      ws.on('close', () => {
        logEvent('terminal_manager.connection_closed', {
          sessionId,
          userId,
        });
        
        // Kill PTY if still running
        if (!ptyProcess.killed) {
          ptyProcess.kill();
        }
        
        this.sessions.delete(sessionId);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error('[TerminalManager] WebSocket error:', error);
        logEvent('terminal_manager.websocket_error', {
          sessionId,
          error: error.message,
        });
      });

    } catch (error) {
      console.error('[TerminalManager] Error spawning terminal:', error);
      
      logEvent('terminal_manager.spawn_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to spawn terminal' 
      }));
      ws.close();
    }
  }

  private generateSessionId(): string {
    return `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    if (!session.pty.killed) {
      session.pty.kill();
    }

    if (session.ws.readyState === WebSocket.OPEN) {
      session.ws.close();
    }

    this.sessions.delete(sessionId);

    logEvent('terminal_manager.session_closed', {
      sessionId,
      userId: session.userId,
    });

    return true;
  }

  cleanup() {
    // Close all sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      this.closeSession(sessionId);
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    logEvent('terminal_manager.cleaned_up', {
      sessionsClosed: this.sessions.size,
    });
  }
}

// Export singleton instance
export const terminalManager = new TerminalManager();
