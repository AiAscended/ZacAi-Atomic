import crypto from 'crypto';
import { EventEmitter } from 'events';

function acceptKey(key) {
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  return crypto.createHash('sha1').update(key + GUID).digest('base64');
}

// Minimal WebSocket connection wrapper
class SimpleWSConnection extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    socket.on('data', (chunk) => this._onData(chunk));
    socket.on('close', () => this.emit('close'));
    socket.on('end', () => this.emit('close'));
    socket.on('error', (e) => this.emit('error', e));
  }

  _onData(buf) {
    // parse single-frame text messages (client frames are masked)
    try {
      const b0 = buf[0];
      const fin = !!(b0 & 0x80);
      const opcode = b0 & 0x0f;
      if (opcode === 0x8) { this.socket.end(); this.emit('close'); return; }
      const b1 = buf[1];
      const masked = !!(b1 & 0x80);
      let len = b1 & 0x7f;
      let offset = 2;
      if (len === 126) { len = buf.readUInt16BE(offset); offset += 2; }
      else if (len === 127) { len = Number(buf.readBigUInt64BE(offset)); offset += 8; }
      let mask = null;
      if (masked) { mask = buf.slice(offset, offset + 4); offset += 4; }
      const payload = buf.slice(offset, offset + len);
      let data = payload;
      if (masked && mask) {
        const unmasked = Buffer.alloc(len);
        for (let i = 0; i < len; i++) unmasked[i] = payload[i] ^ mask[i % 4];
        data = unmasked;
      }
      if (opcode === 1) {
        this.emit('message', data.toString('utf8'));
      }
    } catch (e) {
      this.emit('error', e);
    }
  }

  send(text) {
    try {
      const payload = Buffer.from(String(text), 'utf8');
      const header = Buffer.alloc(2);
      header[0] = 0x80 | 0x1; // FIN + text
      const len = payload.length;
      if (len < 126) {
        header[1] = len;
        this.socket.write(Buffer.concat([header, payload]));
      } else if (len < 65536) {
        const h = Buffer.alloc(4);
        h[0] = 0x80 | 0x1;
        h[1] = 126;
        h.writeUInt16BE(len, 2);
        this.socket.write(Buffer.concat([h, payload]));
      } else {
        const h = Buffer.alloc(10);
        h[0] = 0x80 | 0x1;
        h[1] = 127;
        h.writeBigUInt64BE(BigInt(len), 2);
        this.socket.write(Buffer.concat([h, payload]));
      }
    } catch (e) { this.emit('error', e); }
  }

  close() { try { this.socket.end(); } catch (e) {} }
}

// Attach a minimal WebSocket handler to an http server
export function attachSimpleWebSocket(server, path, onConnection) {
  server.on('upgrade', (req, socket, head) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      if (url.pathname !== path) return;
      const key = req.headers['sec-websocket-key'];
      if (!key) { socket.destroy(); return; }
      const accept = acceptKey(key);
      const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${accept}`,
      ];
      socket.write(headers.join('\r\n') + '\r\n\r\n');
      const conn = new SimpleWSConnection(socket);
      onConnection(conn, req);
    } catch (e) {
      try { socket.destroy(); } catch (e2) {}
    }
  });
}

export default { attachSimpleWebSocket };
