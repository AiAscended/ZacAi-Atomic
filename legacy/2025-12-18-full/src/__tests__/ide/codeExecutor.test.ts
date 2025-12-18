/**
 * Tests for Code Executor
 */

import { describe, it, expect } from 'vitest';
import { CodeExecutor } from '@/ide/codeExecutor';

describe('CodeExecutor', () => {
  const executor = new CodeExecutor();

  describe('JavaScript Execution', () => {
    it('should execute simple JavaScript code', async () => {
      const code = `console.log('Hello, World!');`;
      const result = await executor.executeJavaScript(code);
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Hello, World!');
    });

    it('should capture console.log output', async () => {
      const code = `
        console.log('Line 1');
        console.log('Line 2');
      `;
      const result = await executor.executeJavaScript(code);
      
      expect(result.logs.length).toBe(2);
      expect(result.logs[0].message).toBe('Line 1');
      expect(result.logs[1].message).toBe('Line 2');
    });

    it('should handle errors gracefully', async () => {
      const code = `throw new Error('Test error');`;
      const result = await executor.executeJavaScript(code);
      
      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('Test error');
    });

    it('should timeout long-running code', async () => {
      const code = `while(true) {}`;
      const result = await executor.executeJavaScript(code, { timeout: 1000 });
      
      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Code Validation', () => {
    it('should validate safe code', () => {
      const code = `console.log('safe code');`;
      const validation = executor.validateCode(code);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject code that is too large', () => {
      const code = 'x'.repeat(200000);
      const validation = executor.validateCode(code);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Preview Generation', () => {
    it('should generate HTML preview', async () => {
      const html = '<h1>Title</h1>';
      const css = 'h1 { color: red; }';
      const js = `console.log('loaded');`;
      
      const preview = await executor.executePreview(html, css, js);
      
      expect(preview).toContain('<!DOCTYPE html>');
      expect(preview).toContain('<h1>Title</h1>');
      expect(preview).toContain('h1 { color: red; }');
    });
  });

  describe('Supported Languages', () => {
    it('should list supported languages', () => {
      const languages = executor.getSupportedLanguages();
      
      expect(languages).toContain('javascript');
      expect(languages).toContain('typescript');
      expect(languages).toContain('html');
      expect(languages).toContain('css');
    });
  });

  describe('Execution Limits', () => {
    it('should provide execution limits', () => {
      const limits = executor.getExecutionLimits();
      
      expect(limits.maxTimeout).toBeGreaterThan(0);
      expect(limits.defaultTimeout).toBeGreaterThan(0);
      expect(limits.maxCodeSize).toBeGreaterThan(0);
    });
  });
});
