/**
 * Tests for Command Processor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CommandProcessor } from '@/lib/ide/commandProcessor';
import { VirtualFileSystem } from '@/lib/ide/virtualFileSystem';

describe('CommandProcessor', () => {
  let processor: CommandProcessor;
  let fs: VirtualFileSystem;

  beforeEach(async () => {
    fs = new VirtualFileSystem();
    await fs.initialize();
    processor = new CommandProcessor(fs);
  });

  describe('Basic Commands', () => {
    it('should execute pwd command', async () => {
      const result = await processor.executeCommand('pwd');
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('/');
    });

    it('should execute echo command', async () => {
      const result = await processor.executeCommand('echo Hello World');
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Hello World');
    });

    it('should execute help command', async () => {
      const result = await processor.executeCommand('help');
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Available Commands');
    });
  });

  describe('File Operations', () => {
    it('should create file with touch', async () => {
      const result = await processor.executeCommand('touch test.txt');
      
      expect(result.exitCode).toBe(0);
      const exists = await fs.exists('/test.txt');
      expect(exists).toBe(true);
    });

    it('should list files with ls', async () => {
      await fs.write('/file1.txt', 'content');
      await fs.write('/file2.txt', 'content');
      
      const result = await processor.executeCommand('ls');
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('file1.txt');
      expect(result.output).toContain('file2.txt');
    });

    it('should read file with cat', async () => {
      await fs.write('/test.txt', 'Test Content');
      
      const result = await processor.executeCommand('cat test.txt');
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Test Content');
    });

    it('should create directory with mkdir', async () => {
      const result = await processor.executeCommand('mkdir new-folder');
      
      expect(result.exitCode).toBe(0);
      const exists = await fs.exists('/new-folder');
      expect(exists).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return error for unknown command', async () => {
      const result = await processor.executeCommand('unknown-command');
      
      expect(result.exitCode).not.toBe(0);
      expect(result.output).toContain('command not found');
    });

    it('should handle empty commands', async () => {
      const result = await processor.executeCommand('');
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe('');
    });
  });

  describe('Command History', () => {
    it('should store command history', async () => {
      await processor.executeCommand('echo test1');
      await processor.executeCommand('echo test2');
      
      const history = processor.getHistory();
      
      expect(history).toContain('echo test1');
      expect(history).toContain('echo test2');
    });

    it('should navigate command history', async () => {
      await processor.executeCommand('command1');
      await processor.executeCommand('command2');
      
      const prev = processor.getPreviousCommand();
      expect(prev).toBe('command2');
    });
  });
});
