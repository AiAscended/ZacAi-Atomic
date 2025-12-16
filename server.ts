/**
 * Entry point for the custom Next.js + WebSocket server used by the admin dev console.
 * Keeps everything in one place so `npm run dev` just works inside the Codespace/container.
 */

import { createServer } from 'http';
import { parse, pathToFileURL } from 'url';
import next from 'next';
import { terminalManager } from './src/lib/terminalManager';

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
  terminalManager.initialize(server);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Graceful shutdown
  process.once('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    terminalManager.cleanup();
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  process.once('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    terminalManager.cleanup();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

// Start server if this module is executed directly (not imported)
const invokedFromCLI = process.argv[1]
  ? pathToFileURL(process.argv[1]).href === import.meta.url
  : false;

if (invokedFromCLI) {
  startServer().catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
}
