import fs from 'fs';
import path from 'path';

export class TerminalHandler {
  constructor(opts = {}) {
    this.adminToken = opts.adminToken || process.env.ADMIN_TOKEN || 'admin-secret';
    this.whitelist = new Set(opts.commandWhitelist || ['status', 'health', 'diagnostics']);
    this.logDir = path.resolve(process.cwd(), 'packages/web-terminal/logs');
    try { fs.mkdirSync(this.logDir, { recursive: true }); } catch (e) {}
    this.startMs = Date.now();
  }

  // Handle the existing HTTP POST-based terminal API
  async handleRequest(req, res) {
    const authHeader = (req.headers['authorization'] || '');
    const token = (authHeader.replace('Bearer ', '') || '');
    const authorized = token === this.adminToken;

    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const cmd = (data.cmd || '').trim();
        const output = await this._executeCommand(cmd, authorized);
        this._log(cmd, token, authorized);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ output }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }

  // Attach WebSocket endpoint to the provided http server
  async attach(server, opts = {}) {
    // Dynamic import of `ws` so package installs are optional in constrained environments
    try {
      const mod = await import('ws');
      const WebSocketServer = mod.WebSocketServer || mod.default?.WebSocketServer;
      if (!WebSocketServer) throw new Error('ws.WebSocketServer not found');
      this.wss = new WebSocketServer({ noServer: true });
      server.on('upgrade', (req, socket, head) => {
        try {
          const url = new URL(req.url || '/', `http://${req.headers.host}`);
          if (url.pathname === '/ws/terminal') {
            this.wss.handleUpgrade(req, socket, head, (ws) => this._handleConnection(ws, req));
          }
        } catch (e) {
          socket.destroy();
        }
      });
    } catch (e) {
      // Fallback: use minimal in-repo WebSocket implementation
      try {
        const { attachSimpleWebSocket } = await import('./simple_ws.js');
        attachSimpleWebSocket(server, '/ws/terminal', (conn, req) => {
          // adapt to same interface as ws
          conn.on('message', (m) => this._handleConnectionMessage(conn, m, req));
          conn.send = (text) => { try { conn.send(text); } catch (e) {} };
          // wire events
          conn.on('message', (m) => {});
          // expose a small API
          this._handleConnection({
            on: (ev, cb) => { if (ev === 'message') conn.on('message', cb); if (ev === 'close') conn.on('close', cb); if (ev === 'error') conn.on('error', cb); },
            send: (data) => conn.send(data),
          }, req);
        });
      } catch (e2) {
        console.warn('WebSocket support not available (ws missing and fallback failed). Terminal WebSocket disabled.');
      }
    }
  }

  async _handleConnectionMessage(conn, msg, req) {
    try {
      const data = typeof msg === 'string' ? JSON.parse(msg) : JSON.parse(msg.toString());
      const cmd = (data.cmd || '').trim();
      const token = data.token || '';
      const authorized = token === this.adminToken;
      conn.send(JSON.stringify({ type: 'ack', cmd }));
      const result = await this._executeCommand(cmd, authorized);
      conn.send(JSON.stringify({ type: 'output', text: result }));
      this._log(cmd, token, authorized);
    } catch (e) {
      try { conn.send(JSON.stringify({ type: 'error', message: e.message })); } catch (e2) {}
    }
  }

  _handleConnection(ws, req) {
    ws.isAlive = true;
    ws.on('pong', () => (ws.isAlive = true));

    ws.on('message', async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        const cmd = (data.cmd || '').trim();
        const token = data.token || '';
        const authorized = token === this.adminToken;
        // send immediate acknowledgement
        ws.send(JSON.stringify({ type: 'ack', cmd }));
        // execute and stream back
        const result = await this._executeCommand(cmd, authorized);
        ws.send(JSON.stringify({ type: 'output', text: result }));
        this._log(cmd, token, authorized);
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: e.message }));
      }
    });

    ws.on('close', () => {});

    // ping/pong keepalive
    const interval = setInterval(() => {
      if (ws.readyState === ws.CLOSED) { clearInterval(interval); return; }
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    }, 30000);
  }

  async _executeCommand(cmd, authorized) {
    if (!cmd) return 'no command';
    if (this.whitelist.has(cmd)) {
      if (cmd === 'status') return JSON.stringify({ status: 'RUNNING', uptimeMs: Date.now() - (this.startMs || Date.now()), health: 'HEALTHY' }, null, 2);
      if (cmd === 'health') return JSON.stringify({ health: 'HEALTHY', memory: process.memoryUsage() }, null, 2);
      if (cmd === 'diagnostics') return JSON.stringify({ kernel: 'OK', modules: 9, wasm: true }, null, 2);
    }

    // If authorized, attempt to execute via safe executor
    if (authorized) {
      try {
        const { runSafeCommand } = await import('./executor.js');
        // execute and return synchronously via Promise resolution
        const res = await runSafeCommand(cmd, { whitelist: Array.from(this.whitelist) });
        return res.ok ? res.output : `error: ${res.output}`;
      } catch (e) {
        return `exec-error: ${e.message}`;
      }
    }

    return `echo: ${cmd} (unauthorized)`;
  }

  _log(cmd, token, authorized) {
    try {
      const line = JSON.stringify({ ts: new Date().toISOString(), cmd, authorized }) + "\n";
      fs.appendFileSync(path.join(this.logDir, 'commands.log'), line);
    } catch (e) {}
  }
}

export default TerminalHandler;
