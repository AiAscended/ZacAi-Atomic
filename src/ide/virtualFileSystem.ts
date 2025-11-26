import { openDB, DBSchema, IDBPDatabase } from 'idb';

let indexedDBReady: Promise<void> | null = null;

async function ensureIndexedDB(): Promise<void> {
  if (typeof indexedDB !== 'undefined') {
    return;
  }

  if (!indexedDBReady) {
    indexedDBReady = import('fake-indexeddb/auto').then(() => undefined);
  }

  await indexedDBReady;
}

interface IDEFileRecord {
  path: string;
  name?: string;
  content: string;
  type: 'file' | 'directory';
  language: string;
  createdAt: number;
  updatedAt: number;
  size: number;
  parent: string;
}

interface FileSystemDB extends DBSchema {
  files: {
    key: string;
    value: IDEFileRecord;
    indexes: { 'by-parent': string; 'by-type': string };
  };
}

export type IDEFile = IDEFileRecord & { name: string };

export class VirtualFileSystem {
  private db: IDBPDatabase<FileSystemDB> | null = null;
  private dbName = 'zacai-ide-fs';
  private dbVersion = 1;

  async initialize(): Promise<void> {
    await this.init();
  }

  async init() {
    if (this.db) return this.db;

    await ensureIndexedDB();

    this.db = await openDB<FileSystemDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        const fileStore = db.createObjectStore('files', { keyPath: 'path' });
        fileStore.createIndex('by-parent', 'parent');
        fileStore.createIndex('by-type', 'type');
      },
    });

    // Initialize with sample structure if empty
    const count = await this.db.count('files');
    if (count === 0) {
      await this.initializeSampleStructure();
    }

    return this.db;
  }

  private async initializeSampleStructure() {
    const now = Date.now();
    const sampleFiles: IDEFileRecord[] = [
      {
        path: '/',
        name: '/',
        content: '',
        type: 'directory',
        language: '',
        createdAt: now,
        updatedAt: now,
        size: 0,
        parent: '',
      },
      {
        path: '/src',
        name: 'src',
        content: '',
        type: 'directory',
        language: '',
        createdAt: now,
        updatedAt: now,
        size: 0,
        parent: '/',
      },
      {
        path: '/src/app.tsx',
        name: 'app.tsx',
        content: `import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Hello, ZacAi IDE!</h1>
      <p>Start building amazing projects.</p>
    </div>
  );
}

export default App;`,
        type: 'file',
        language: 'typescript',
        createdAt: now,
        updatedAt: now,
        size: 0,
        parent: '/src',
      },
      {
        path: '/src/index.tsx',
        name: 'index.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        type: 'file',
        language: 'typescript',
        createdAt: now,
        updatedAt: now,
        size: 0,
        parent: '/src',
      },
      {
        path: '/src/styles.css',
        name: 'styles.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}`,
        type: 'file',
        language: 'css',
        createdAt: now,
        updatedAt: now,
        size: 0,
        parent: '/src',
      },
      {
        path: '/package.json',
        name: 'package.json',
        content: `{
  "name": "zacai-project",
  "version": "1.0.0",
  "description": "A project created with ZacAi IDE",
  "main": "src/index.tsx",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`,
        type: 'file',
        language: 'json',
        createdAt: now,
        updatedAt: now,
        size: 0,
        parent: '/',
      },
      {
        path: '/README.md',
        name: 'README.md',
        content: `# ZacAi Project

This project was created with ZacAi IDE.

## Getting Started

Open the files in the explorer to start editing.

## Features

- Real-time code editing
- AI-powered assistance
- Integrated terminal
- Live preview

Happy coding!`,
        type: 'file',
        language: 'markdown',
        createdAt: now,
        updatedAt: now,
        size: 0,
        parent: '/',
      },
    ];

    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('files', 'readwrite');
    await Promise.all(sampleFiles.map((file) => tx.store.add(file)));
    await tx.done;
  }

  async readFile(path: string): Promise<IDEFile | undefined> {
    await this.init();
    const file = await this.db!.get('files', path);
    return this.toIDEFile(file);
  }

  async read(path: string): Promise<string | null> {
    const file = await this.readFile(path);
    return file?.content ?? null;
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.init();
    const existing = await this.db!.get('files', path);

    const file: IDEFileRecord = {
      path,
      name: this.getNameFromPath(path),
      content,
      type: 'file',
      language: this.getLanguageFromPath(path),
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      size: new Blob([content]).size,
      parent: this.getParentPath(path),
    };

    await this.db!.put('files', file);
  }

  async write(path: string, content: string): Promise<void> {
    await this.writeFile(path, content);
  }

  async createFile(path: string, content: string = ''): Promise<void> {
    await this.init();
    const existing = await this.db!.get('files', path);
    if (existing) throw new Error(`File already exists: ${path}`);

    const file: IDEFileRecord = {
      path,
      name: this.getNameFromPath(path),
      content,
      type: 'file',
      language: this.getLanguageFromPath(path),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      size: new Blob([content]).size,
      parent: this.getParentPath(path),
    };

    await this.db!.add('files', file);
  }

  async exists(path: string): Promise<boolean> {
    const file = await this.readFile(path);
    return Boolean(file);
  }

  async createDirectory(path: string): Promise<void> {
    await this.init();
    const existing = await this.db!.get('files', path);
    if (existing) throw new Error(`Directory already exists: ${path}`);

    const directory: IDEFileRecord = {
      path,
      name: this.getNameFromPath(path),
      content: '',
      type: 'directory',
      language: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      size: 0,
      parent: this.getParentPath(path),
    };

    await this.db!.add('files', directory);
  }

  async mkdir(path: string): Promise<void> {
    await this.createDirectory(path);
  }

  async deleteFile(path: string): Promise<void> {
    await this.init();
    const file = await this.db!.get('files', path);
    if (!file) throw new Error(`File not found: ${path}`);

    if (file.type === 'directory') {
      // Delete all children recursively
      const children = await this.listDirectory(path);
      for (const child of children) {
        await this.deleteFile(child.path);
      }
    }

    await this.db!.delete('files', path);
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    await this.init();
    const file = await this.db!.get('files', oldPath);
    if (!file) throw new Error(`File not found: ${oldPath}`);

    const newFile: IDEFileRecord = {
      ...file,
      path: newPath,
      name: this.getNameFromPath(newPath),
      parent: this.getParentPath(newPath),
      updatedAt: Date.now(),
    };

    await this.db!.delete('files', oldPath);
    await this.db!.add('files', newFile);

    // If directory, rename all children
    if (file.type === 'directory') {
      const children = await this.listDirectory(oldPath);
      for (const child of children) {
        const newChildPath = child.path.replace(oldPath, newPath);
        await this.renameFile(child.path, newChildPath);
      }
    }
  }

  async listDirectory(path: string): Promise<IDEFile[]> {
    await this.init();
    const allFiles = await this.db!.getAllFromIndex('files', 'by-parent', path);
    return allFiles.map((file) => this.toIDEFile(file)).filter((file): file is IDEFile => Boolean(file));
  }

  async list(path: string): Promise<IDEFile[]> {
    return this.listDirectory(path);
  }

  async getDirectoryTree(rootPath: string = '/'): Promise<IDEFile[]> {
    await this.init();
    const allFiles = await this.db!.getAll('files');
    return allFiles
      .filter((file) => file.path.startsWith(rootPath) || file.path === rootPath)
      .map((file) => this.toIDEFile(file))
      .filter((file): file is IDEFile => Boolean(file));
  }

  async searchFiles(query: string): Promise<IDEFile[]> {
    await this.init();
    const allFiles = await this.db!.getAll('files');
    const lowerQuery = query.toLowerCase();
    
    return allFiles
      .filter((file) => {
        const record = this.toIDEFile(file);
        if (!record) return false;
        return (
          record.type === 'file' &&
          (record.name.toLowerCase().includes(lowerQuery) ||
            record.content.toLowerCase().includes(lowerQuery))
        );
      })
      .map((file) => this.toIDEFile(file))
      .filter((file): file is IDEFile => Boolean(file));
  }

  async clearAll(): Promise<void> {
    await this.init();
    await this.db!.clear('files');
    await this.initializeSampleStructure();
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      tsx: 'typescriptreact',
      ts: 'typescript',
      jsx: 'javascriptreact',
      js: 'javascript',
      json: 'json',
      css: 'css',
      scss: 'scss',
      html: 'html',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
      sql: 'sql',
    };
    return langMap[ext || ''] || 'plaintext';
  }

  private getParentPath(path: string): string {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return parts.length > 0 ? '/' + parts.join('/') : '/';
  }

  detectLanguage(path: string): string {
    return this.getLanguageFromPath(path);
  }

  private getNameFromPath(path: string): string {
    if (path === '/') {
      return '/';
    }
    const parts = path.split('/').filter(Boolean);
    return parts.pop() || '/';
  }

  private toIDEFile(file: IDEFileRecord | undefined): IDEFile | undefined {
    if (!file) return undefined;
    if (file.name && file.name.length > 0) {
      return file as IDEFile;
    }

    const normalized: IDEFileRecord = {
      ...file,
      name: this.getNameFromPath(file.path),
    };

    // Persist the normalized name for future reads
    this.db?.put('files', normalized).catch(() => {
      // Ignore normalization write errors
    });

    return normalized as IDEFile;
  }
}

export const vfs = new VirtualFileSystem();
