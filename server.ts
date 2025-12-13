/**
 * File: src/lib/server/websocketServer.ts
 * Purpose: Initialize WebSocket server for dev console terminal
 * Note: This needs to be called from the Next.js custom server
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import terminalManager from '@/lib/terminalManager';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

export async function startServer() {
  await app.prepare();

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket terminal manager
  await terminalManager.initialize(server);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    terminalManager.closeAllTerminals();
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    terminalManager.closeAllTerminals();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

// Start server if this file is run directly (ESM compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
}
