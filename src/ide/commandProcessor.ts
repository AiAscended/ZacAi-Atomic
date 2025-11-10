/**
 * Command Processor for IDE Terminal
 * Handles shell-like commands in the browser
 */

import { VirtualFileSystem, type IDEFile } from './virtualFileSystem';

export interface CommandResult {
  output: string;
  exitCode: number;
  error?: string;
}

export interface CommandContext {
  fs: VirtualFileSystem;
  currentPath: string;
  environment: Record<string, string>;
}

export class CommandProcessor {
  private context: CommandContext;
  private commandHistory: string[] = [];
  private historyIndex = -1;

  constructor(fs: VirtualFileSystem) {
    this.context = {
      fs,
      currentPath: '/',
      environment: {
        HOME: '/',
        PATH: '/bin:/usr/bin:/usr/local/bin',
        USER: 'zacai',
        SHELL: '/bin/bash',
      },
    };
  }

  async executeCommand(commandLine: string): Promise<CommandResult> {
    if (!commandLine.trim()) {
      return { output: '', exitCode: 0 };
    }

    // Add to history
    this.commandHistory.push(commandLine);
    this.historyIndex = this.commandHistory.length;

    // Parse command
    const parts = this.parseCommand(commandLine);
    const command = parts[0];
    const args = parts.slice(1);

    try {
      // Route to appropriate handler
      switch (command) {
        case 'ls':
          return await this.handleLs(args);
        case 'cd':
          return await this.handleCd(args);
        case 'pwd':
          return await this.handlePwd();
        case 'cat':
          return await this.handleCat(args);
        case 'mkdir':
          return await this.handleMkdir(args);
        case 'touch':
          return await this.handleTouch(args);
        case 'rm':
          return await this.handleRm(args);
        case 'echo':
          return await this.handleEcho(args);
        case 'clear':
          return { output: '\x1bc', exitCode: 0 };
        case 'help':
          return await this.handleHelp();
        case 'tree':
          return await this.handleTree(args);
        case 'find':
          return await this.handleFind(args);
        case 'grep':
          return await this.handleGrep(args);
        case 'node':
          return await this.handleNode(args);
        case 'npm':
          return await this.handleNpm(args);
        case 'git':
          return await this.handleGit(args);
        default:
          return {
            output: `bash: ${command}: command not found\n`,
            exitCode: 127,
            error: 'Command not found',
          };
      }
    } catch (error) {
      return {
        output: `Error: ${error instanceof Error ? error.message : String(error)}\n`,
        exitCode: 1,
        error: String(error),
      };
    }
  }

  private parseCommand(commandLine: string): string[] {
    // Simple parsing - can be enhanced for quotes, pipes, etc.
    return commandLine.trim().split(/\s+/);
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    if (path === '~') {
      return this.context.environment.HOME;
    }
    if (path.startsWith('~/')) {
      return this.context.environment.HOME + path.slice(1);
    }
    if (path === '.') {
      return this.context.currentPath;
    }
    if (path === '..') {
      const parts = this.context.currentPath.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/');
    }
    // Relative path
    const base = this.context.currentPath === '/' ? '' : this.context.currentPath;
    return base + '/' + path;
  }

  private async handleLs(args: string[]): Promise<CommandResult> {
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
    const path = args.find((arg) => !arg.startsWith('-')) || this.context.currentPath;
    const resolvedPath = this.resolvePath(path);

    try {
      const items = await this.context.fs.listDirectory(resolvedPath);
      
      if (items.length === 0) {
        return { output: '', exitCode: 0 };
      }

      let output = '';
      if (longFormat) {
        for (const item of items) {
          const type = item.type === 'directory' ? 'd' : '-';
          const perms = 'rwxr-xr-x';
          const size = item.metadata?.size || 0;
          const date = item.metadata?.modified
            ? new Date(item.metadata.modified).toLocaleDateString()
            : 'Unknown';
          output += `${type}${perms} 1 zacai zacai ${size.toString().padStart(8)} ${date} ${item.name}\n`;
        }
      } else {
        output = items.map((item) => item.name).join('  ') + '\n';
      }

      return { output, exitCode: 0 };
    } catch (error) {
      return {
        output: `ls: cannot access '${path}': No such file or directory\n`,
        exitCode: 2,
        error: String(error),
      };
    }
  }

  private async handleCd(args: string[]): Promise<CommandResult> {
    const path = args[0] || this.context.environment.HOME;
    const resolvedPath = this.resolvePath(path);

    try {
      const entry = await this.context.fs.readFile(resolvedPath);
      if (!entry) {
        return {
          output: `cd: ${path}: No such file or directory\n`,
          exitCode: 1,
          error: 'Directory not found',
        };
      }

      if (entry.type !== 'directory') {
        return {
          output: `cd: ${path}: Not a directory\n`,
          exitCode: 1,
          error: 'Not a directory',
        };
      }

      this.context.currentPath = resolvedPath;
      return { output: '', exitCode: 0 };
    } catch (error) {
      return {
        output: `cd: ${path}: No such file or directory\n`,
        exitCode: 1,
        error: String(error),
      };
    }
  }

  private async handlePwd(): Promise<CommandResult> {
    return {
      output: this.context.currentPath + '\n',
      exitCode: 0,
    };
  }

  private async handleCat(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        output: 'cat: missing file operand\n',
        exitCode: 1,
        error: 'Missing file operand',
      };
    }

    let output = '';
    for (const arg of args) {
      const path = this.resolvePath(arg);
      try {
        const fileEntry = await this.context.fs.readFile(path);
        if (!fileEntry || fileEntry.type !== 'file') {
          output += `cat: ${arg}: No such file or directory\n`;
          continue;
        }

        output += `${fileEntry.content}\n`;
      } catch {
        output += `cat: ${arg}: No such file or directory\n`;
      }
    }

    return { output, exitCode: 0 };
  }

  private async handleMkdir(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        output: 'mkdir: missing operand\n',
        exitCode: 1,
        error: 'Missing operand',
      };
    }

    for (const arg of args) {
      if (arg.startsWith('-')) continue; // Skip flags
      const path = this.resolvePath(arg);
      try {
        await this.context.fs.createDirectory(path);
      } catch (error) {
        return {
          output: `mkdir: cannot create directory '${arg}': ${error}\n`,
          exitCode: 1,
          error: String(error),
        };
      }
    }

    return { output: '', exitCode: 0 };
  }

  private async handleTouch(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        output: 'touch: missing file operand\n',
        exitCode: 1,
        error: 'Missing file operand',
      };
    }

    for (const arg of args) {
      const path = this.resolvePath(arg);
      try {
        const existing = await this.context.fs.readFile(path);
        if (existing) {
          await this.context.fs.writeFile(path, existing.content);
        } else {
          await this.context.fs.createFile(path, '');
        }
      } catch (error) {
        return {
          output: `touch: cannot touch '${arg}': ${error}\n`,
          exitCode: 1,
          error: String(error),
        };
      }
    }

    return { output: '', exitCode: 0 };
  }

  private async handleRm(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        output: 'rm: missing operand\n',
        exitCode: 1,
        error: 'Missing operand',
      };
    }

    const recursive = args.includes('-r') || args.includes('-rf');
    const files = args.filter((arg) => !arg.startsWith('-'));

    for (const file of files) {
      const path = this.resolvePath(file);
      try {
        const entry = await this.context.fs.readFile(path);
        if (!entry) {
          return {
            output: `rm: cannot remove '${file}': No such file or directory\n`,
            exitCode: 1,
            error: 'Not found',
          };
        }

        if (entry.type === 'directory' && !recursive) {
          return {
            output: `rm: cannot remove '${file}': Is a directory (use -r)\n`,
            exitCode: 1,
            error: 'Is a directory',
          };
        }

        await this.context.fs.deleteFile(path);
      } catch (error) {
        return {
          output: `rm: cannot remove '${file}': ${error}\n`,
          exitCode: 1,
          error: String(error),
        };
      }
    }

    return { output: '', exitCode: 0 };
  }

  private async handleEcho(args: string[]): Promise<CommandResult> {
    const output = args.join(' ') + '\n';
    return { output, exitCode: 0 };
  }

  private async handleHelp(): Promise<CommandResult> {
    const output = `
ZacAi IDE Terminal - Available Commands:

File System:
  ls [-l] [path]       List directory contents
  cd [path]            Change directory
  pwd                  Print working directory
  cat <file>           Display file contents
  mkdir <dir>          Create directory
  touch <file>         Create empty file
  rm [-r] <file>       Remove file or directory
  tree [path]          Display directory tree
  find <name>          Search for files

Text Processing:
  echo <text>          Print text
  grep <pattern> <file> Search for pattern in file

Development:
  node <file>          Execute JavaScript file
  npm <command>        NPM package manager
  git <command>        Git version control

System:
  clear                Clear terminal
  help                 Show this help message

For more information, type: man <command>
`;
    return { output, exitCode: 0 };
  }

  private async handleTree(args: string[]): Promise<CommandResult> {
    const path = args[0] || this.context.currentPath;
    const resolvedPath = this.resolvePath(path);

  const buildTree = async (dirPath: string, prefix = ''): Promise<string> => {
      let output = '';
      try {
        const items = await this.context.fs.listDirectory(dirPath);
        items.sort((a: IDEFile, b: IDEFile) => {
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        });

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const isLastItem = i === items.length - 1;
          const connector = isLastItem ? '└── ' : '├── ';
          const icon = item.type === 'directory' ? '📁 ' : '📄 ';
          
          output += prefix + connector + icon + item.name + '\n';

          if (item.type === 'directory') {
            const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
            output += await buildTree(item.path, newPrefix);
          }
        }
      } catch {
        // Silently ignore errors in subdirectories
      }
      return output;
    };

    try {
      let output = resolvedPath + '\n';
      output += await buildTree(resolvedPath);
      return { output, exitCode: 0 };
    } catch (error) {
      return {
        output: `tree: ${path}: No such directory\n`,
        exitCode: 1,
        error: String(error),
      };
    }
  }

  private async handleFind(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        output: 'find: missing search term\n',
        exitCode: 1,
        error: 'Missing search term',
      };
    }

    const searchTerm = args[0];
    try {
      const results = await this.context.fs.searchFiles(searchTerm);
      const output = results.map((r: IDEFile) => r.path).join('\n') + (results.length > 0 ? '\n' : '');
      return { output, exitCode: 0 };
    } catch (error) {
      return {
        output: `find: search failed: ${error}\n`,
        exitCode: 1,
        error: String(error),
      };
    }
  }

  private async handleGrep(args: string[]): Promise<CommandResult> {
    if (args.length < 2) {
      return {
        output: 'grep: missing pattern or file\n',
        exitCode: 1,
        error: 'Missing arguments',
      };
    }

    const pattern = args[0];
    const filePath = this.resolvePath(args[1]);

    try {
      const fileEntry = await this.context.fs.readFile(filePath);
      if (!fileEntry || fileEntry.type !== 'file') {
        return {
          output: `grep: ${args[1]}: No such file\n`,
          exitCode: 2,
          error: 'File not found',
        };
      }

      const lines = fileEntry.content.split('\n');
      const matches = lines.filter((line: string) => line.includes(pattern));
      const output = matches.join('\n') + (matches.length > 0 ? '\n' : '');
      return { output, exitCode: matches.length > 0 ? 0 : 1 };
    } catch (error) {
      return {
        output: `grep: ${args[1]}: No such file\n`,
        exitCode: 2,
        error: String(error),
      };
    }
  }

  private async handleNode(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        output: 'Node.js REPL - Phase 4 Enhancement\nType: node <file.js> to execute\n',
        exitCode: 0,
      };
    }

    // This is a placeholder - actual execution would require WebContainers or similar
    return {
      output: 'Node.js execution coming soon in Phase 4 enhancement...\n',
      exitCode: 0,
    };
  }

  private async handleNpm(args: string[]): Promise<CommandResult> {
    const command = args[0];
    
    if (!command) {
      return {
        output: 'npm: missing command\nUsage: npm <install|run|test|...>\n',
        exitCode: 1,
        error: 'Missing command',
      };
    }

    // Placeholder for npm commands
    return {
      output: `npm ${command} - Package management coming in Phase 4 enhancement...\n`,
      exitCode: 0,
    };
  }

  private async handleGit(args: string[]): Promise<CommandResult> {
    const command = args[0];

    if (!command) {
      return {
        output: 'git: missing command\nUsage: git <status|add|commit|push|pull|...>\n',
        exitCode: 1,
        error: 'Missing command',
      };
    }

    // Placeholder for git commands - Phase 3 has GitHub integration
    return {
      output: `git ${command} - Git integration available via GitHub panel\n`,
      exitCode: 0,
    };
  }

  getHistory(): string[] {
    return [...this.commandHistory];
  }

  getPreviousCommand(): string | null {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.commandHistory[this.historyIndex];
    }
    return null;
  }

  getNextCommand(): string | null {
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      return this.commandHistory[this.historyIndex];
    }
    return null;
  }

  getCurrentPath(): string {
    return this.context.currentPath;
  }

  getPrompt(): string {
    return `\x1b[1;32m${this.context.environment.USER}\x1b[0m:\x1b[1;34m${this.context.currentPath}\x1b[0m$ `;
  }
}
