/**
 * Tests for Virtual File System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystem } from '@/lib/ide/virtualFileSystem';

describe('VirtualFileSystem', () => {
  let fs: VirtualFileSystem;

  beforeEach(async () => {
    fs = new VirtualFileSystem();
    await fs.initialize();
  });

  describe('Basic Operations', () => {
    it('should create and read a file', async () => {
      const path = '/test.txt';
      const content = 'Hello, World!';
      
      await fs.write(path, content);
      const result = await fs.read(path);
      
      expect(result).toBe(content);
    });

    it('should check if file exists', async () => {
      const path = '/exists.txt';
      
      await fs.write(path, 'content');
      const exists = await fs.exists(path);
      const notExists = await fs.exists('/not-exists.txt');
      
      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('should create directories', async () => {
      const path = '/my-folder';
      
      await fs.mkdir(path);
      const exists = await fs.exists(path);
      
      expect(exists).toBe(true);
    });

    it('should list directory contents', async () => {
      await fs.write('/file1.txt', 'content1');
      await fs.write('/file2.txt', 'content2');
      await fs.mkdir('/folder1');
      
      const items = await fs.list('/');
      
      expect(items.length).toBeGreaterThanOrEqual(3);
      expect(items.some(item => item.name === 'file1.txt')).toBe(true);
    });
  });

  describe('Language Detection', () => {
    it('should detect JavaScript files', () => {
      expect(fs.detectLanguage('test.js')).toBe('javascript');
      expect(fs.detectLanguage('test.jsx')).toBe('javascriptreact');
    });

    it('should detect TypeScript files', () => {
      expect(fs.detectLanguage('test.ts')).toBe('typescript');
      expect(fs.detectLanguage('test.tsx')).toBe('typescriptreact');
    });
  });
});
