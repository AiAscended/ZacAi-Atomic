/**
 * File: src/lib/ide/virtualFileSystem.ts
 * Purpose: IndexedDB-based virtual file system for IDE
 */

export interface FileMetadata {
  created: Date;
  modified: Date;
  size: number;
}

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: string[]; // IDs of children for directories
  parent?: string; // ID of parent directory
  metadata: FileMetadata;
}

export class VirtualFileSystem {
  private dbName = 'ZacAi-IDE-FileSystem';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('files')) {
          const objectStore = db.createObjectStore('files', { keyPath: 'id' });
          objectStore.createIndex('path', 'path', { unique: true });
          objectStore.createIndex('parent', 'parent', { unique: false });
          objectStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async read(path: string): Promise<string> {
    const file = await this.getByPath(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    if (file.type !== 'file') {
      throw new Error(`Path is a directory: ${path}`);
    }
    return file.content || '';
  }

  async write(path: string, content: string): Promise<void> {
    const existingFile = await this.getByPath(path);
    
    if (existingFile) {
      // Update existing file
      existingFile.content = content;
      existingFile.metadata.modified = new Date();
      existingFile.metadata.size = new Blob([content]).size;
      await this.put(existingFile);
    } else {
      // Create new file
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const fileName = path.substring(path.lastIndexOf('/') + 1);
      
      // Ensure parent directory exists
      let parent = await this.getByPath(parentPath);
      if (!parent) {
        await this.mkdir(parentPath);
        parent = await this.getByPath(parentPath);
      }

      const newFile: VirtualFile = {
        id: this.generateId(),
        name: fileName,
        path,
        type: 'file',
        content,
        parent: parent?.id,
        metadata: {
          created: new Date(),
          modified: new Date(),
          size: new Blob([content]).size,
        },
      };

      await this.put(newFile);
      
      // Add to parent's children
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(newFile.id);
        await this.put(parent);
      }
    }
  }

  async delete(path: string): Promise<void> {
    const file = await this.getByPath(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }

    if (file.type === 'directory' && file.children && file.children.length > 0) {
      // Delete all children recursively
      const children = await Promise.all(
        file.children.map(id => this.getById(id))
      );
      
      for (const child of children) {
        if (child) {
          await this.delete(child.path);
        }
      }
    }

    // Remove from parent's children list
    if (file.parent) {
      const parent = await this.getById(file.parent);
      if (parent && parent.children) {
        parent.children = parent.children.filter(id => id !== file.id);
        await this.put(parent);
      }
    }

    // Delete the file
    await this.deleteById(file.id);
  }

  async list(path: string): Promise<VirtualFile[]> {
    const dir = await this.getByPath(path);
    if (!dir) {
      throw new Error(`Directory not found: ${path}`);
    }
    if (dir.type !== 'directory') {
      throw new Error(`Path is not a directory: ${path}`);
    }

    if (!dir.children || dir.children.length === 0) {
      return [];
    }

    const children = await Promise.all(
      dir.children.map(id => this.getById(id))
    );

    return children.filter(child => child !== null) as VirtualFile[];
  }

  async mkdir(path: string): Promise<void> {
    const existingDir = await this.getByPath(path);
    if (existingDir) {
      if (existingDir.type === 'directory') {
        return; // Directory already exists
      }
      throw new Error(`File exists at path: ${path}`);
    }

    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const dirName = path.substring(path.lastIndexOf('/') + 1);

    // Recursively create parent directories
    if (parentPath !== '/' && !(await this.exists(parentPath))) {
      await this.mkdir(parentPath);
    }

    const parent = await this.getByPath(parentPath);

    const newDir: VirtualFile = {
      id: this.generateId(),
      name: dirName || '/',
      path,
      type: 'directory',
      children: [],
      parent: parent?.id,
      metadata: {
        created: new Date(),
        modified: new Date(),
        size: 0,
      },
    };

    await this.put(newDir);

    // Add to parent's children
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(newDir.id);
      await this.put(parent);
    }
  }

  async exists(path: string): Promise<boolean> {
    const file = await this.getByPath(path);
    return file !== null;
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const file = await this.getByPath(oldPath);
    if (!file) {
      throw new Error(`File not found: ${oldPath}`);
    }

    const newName = newPath.substring(newPath.lastIndexOf('/') + 1);
    file.name = newName;
    file.path = newPath;
    file.metadata.modified = new Date();

    await this.put(file);
  }

  async move(sourcePath: string, destPath: string): Promise<void> {
    const sourceFile = await this.getByPath(sourcePath);
    if (!sourceFile) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    const destParentPath = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
    const destParent = await this.getByPath(destParentPath);
    if (!destParent || destParent.type !== 'directory') {
      throw new Error(`Destination directory not found: ${destParentPath}`);
    }

    // Remove from old parent
    if (sourceFile.parent) {
      const oldParent = await this.getById(sourceFile.parent);
      if (oldParent && oldParent.children) {
        oldParent.children = oldParent.children.filter(id => id !== sourceFile.id);
        await this.put(oldParent);
      }
    }

    // Update file
    sourceFile.parent = destParent.id;
    sourceFile.path = destPath;
    sourceFile.name = destPath.substring(destPath.lastIndexOf('/') + 1);
    sourceFile.metadata.modified = new Date();
    await this.put(sourceFile);

    // Add to new parent
    if (!destParent.children) {
      destParent.children = [];
    }
    destParent.children.push(sourceFile.id);
    await this.put(destParent);
  }

  async search(query: string): Promise<VirtualFile[]> {
    const allFiles = await this.getAllFiles();
    const lowercaseQuery = query.toLowerCase();
    
    return allFiles.filter(file =>
      file.name.toLowerCase().includes(lowercaseQuery) ||
      file.path.toLowerCase().includes(lowercaseQuery)
    );
  }

  async clear(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const objectStore = transaction.objectStore('files');
      const request = objectStore.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Private helper methods

  private async getById(id: string): Promise<VirtualFile | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const objectStore = transaction.objectStore('files');
      const request = objectStore.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private async getByPath(path: string): Promise<VirtualFile | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const objectStore = transaction.objectStore('files');
      const index = objectStore.index('path');
      const request = index.get(path);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private async put(file: VirtualFile): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const objectStore = transaction.objectStore('files');
      const request = objectStore.put(file);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async deleteById(id: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const objectStore = transaction.objectStore('files');
      const request = objectStore.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getAllFiles(): Promise<VirtualFile[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const objectStore = transaction.objectStore('files');
      const request = objectStore.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

// Singleton instance
let vfsInstance: VirtualFileSystem | null = null;

export async function getVFS(): Promise<VirtualFileSystem> {
  if (!vfsInstance) {
    vfsInstance = new VirtualFileSystem();
    await vfsInstance.initialize();
    
    // Initialize with root directory if empty
    if (!(await vfsInstance.exists('/'))) {
      await vfsInstance.mkdir('/');
    }
  }
  return vfsInstance;
}
