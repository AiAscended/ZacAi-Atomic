import { vfs } from './virtualFileSystem';

export interface CommandResult {
  output: string;
  exitCode: number;
  error?: string;
}

export interface CommandContext {
  currentDirectory: string;
  environment: Record<string, string>;
  history: string[];
}

class CommandProcessor {
  private context: CommandContext = {
    currentDirectory: '/',
    environment: {
      HOME: '/',
      USER: 'zacai',
      PATH: '/usr/local/bin:/usr/bin:/bin',
      SHELL: '/bin/bash',
      TERM: 'xterm-256color',
    },
    history: [],
  };

  async executeCommand(command: string): Promise<CommandResult> {
    const trimmedCommand = command.trim();
    
    if (!trimmedCommand) {
      return { output: '', exitCode: 0 };
    }

    // Add to history
    this.context.history.push(trimmedCommand);

    // Parse command and arguments
    const parts = this.parseCommand(trimmedCommand);
    const [cmd, ...args] = parts;

    // Execute command
    try {
      switch (cmd) {
        case 'pwd':
          return await this.pwd();
        case 'ls':
          return await this.ls(args);
        case 'cd':
          return await this.cd(args[0] || '/');
        case 'cat':
          return await this.cat(args[0]);
        case 'echo':
          return await this.echo(args.join(' '));
        case 'mkdir':
          return await this.mkdir(args[0]);
        case 'rm':
          return await this.rm(args);
        case 'mv':
          return await this.mv(args[0], args[1]);
        case 'touch':
          return await this.touch(args[0]);
        case 'clear':
          return { output: '\x1b[2J\x1b[H', exitCode: 0 };
        case 'history':
          return await this.history();
        case 'env':
          return await this.env();
        case 'whoami':
          return { output: this.context.environment.USER + '\n', exitCode: 0 };
        case 'help':
          return await this.help();
        case 'node':
          return await this.executeNode(args);
        case 'npm':
          return await this.executeNpm(args);
        default:
          return {
            output: `bash: ${cmd}: command not found\n`,
            exitCode: 127,
            error: 'Command not found',
          };
      }
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private parseCommand(command: string): string[] {
    // Simple parsing - split by spaces, respecting quotes
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < command.length; i++) {
      const char = command[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  private async pwd(): Promise<CommandResult> {
    return {
      output: this.context.currentDirectory + '\n',
      exitCode: 0,
    };
  }

  private async ls(args: string[]): Promise<CommandResult> {
    const showAll = args.includes('-a') || args.includes('--all');
    const longFormat = args.includes('-l') || args.includes('--long');
    
    const path = args.find(arg => !arg.startsWith('-')) || this.context.currentDirectory;
    const fullPath = this.resolvePath(path);

    try {
      const files = await vfs.listDirectory(fullPath);
      
      if (files.length === 0) {
        return { output: '', exitCode: 0 };
      }

      let output = '';
      
      if (longFormat) {
        for (const file of files) {
          const type = file.type === 'directory' ? 'd' : '-';
          const perms = file.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--';
          const size = file.size.toString().padStart(8);
          const date = new Date(file.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
          const name = file.path.split('/').pop();
          output += `${type}${perms} 1 ${this.context.environment.USER} ${size} ${date} ${name}\n`;
        }
      } else {
        const names = files.map(f => {
          const name = f.path.split('/').pop() || '';
          return f.type === 'directory' ? `\x1b[34m${name}/\x1b[0m` : name;
        });
        output = names.join('  ') + '\n';
      }

      return { output, exitCode: 0 };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: `ls: cannot access '${path}': No such file or directory`,
      };
    }
  }

  private async cd(path: string): Promise<CommandResult> {
    if (!path || path === '~') {
      this.context.currentDirectory = this.context.environment.HOME;
      return { output: '', exitCode: 0 };
    }

    const fullPath = this.resolvePath(path);
    
    try {
      const file = await vfs.readFile(fullPath);
      
      if (!file) {
        return {
          output: '',
          exitCode: 1,
          error: `cd: no such file or directory: ${path}`,
        };
      }

      if (file.type !== 'directory') {
        return {
          output: '',
          exitCode: 1,
          error: `cd: not a directory: ${path}`,
        };
      }

      this.context.currentDirectory = fullPath;
      return { output: '', exitCode: 0 };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: `cd: no such file or directory: ${path}`,
      };
    }
  }

  private async cat(path: string): Promise<CommandResult> {
    if (!path) {
      return {
        output: '',
        exitCode: 1,
        error: 'cat: missing file operand',
      };
    }

    const fullPath = this.resolvePath(path);
    
    try {
      const file = await vfs.readFile(fullPath);
      
      if (!file) {
        return {
          output: '',
          exitCode: 1,
          error: `cat: ${path}: No such file or directory`,
        };
      }

      if (file.type === 'directory') {
        return {
          output: '',
          exitCode: 1,
          error: `cat: ${path}: Is a directory`,
        };
      }

      return { output: file.content + '\n', exitCode: 0 };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: `cat: ${path}: No such file or directory`,
      };
    }
  }

  private async echo(text: string): Promise<CommandResult> {
    return { output: text + '\n', exitCode: 0 };
  }

  private async mkdir(path: string): Promise<CommandResult> {
    if (!path) {
      return {
        output: '',
        exitCode: 1,
        error: 'mkdir: missing operand',
      };
    }

    const fullPath = this.resolvePath(path);
    
    try {
      await vfs.createDirectory(fullPath);
      return { output: '', exitCode: 0 };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: error instanceof Error ? error.message : 'mkdir failed',
      };
    }
  }

  private async rm(args: string[]): Promise<CommandResult> {
    const recursive = args.includes('-r') || args.includes('-rf');
    const path = args.find(arg => !arg.startsWith('-'));

    if (!path) {
      return {
        output: '',
        exitCode: 1,
        error: 'rm: missing operand',
      };
    }

    const fullPath = this.resolvePath(path);
    
    try {
      const file = await vfs.readFile(fullPath);
      
      if (!file) {
        return {
          output: '',
          exitCode: 1,
          error: `rm: cannot remove '${path}': No such file or directory`,
        };
      }

      if (file.type === 'directory' && !recursive) {
        return {
          output: '',
          exitCode: 1,
          error: `rm: cannot remove '${path}': Is a directory`,
        };
      }

      await vfs.deleteFile(fullPath);
      return { output: '', exitCode: 0 };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: error instanceof Error ? error.message : 'rm failed',
      };
    }
  }

  private async mv(source: string, dest: string): Promise<CommandResult> {
    if (!source || !dest) {
      return {
        output: '',
        exitCode: 1,
        error: 'mv: missing file operand',
      };
    }

    const sourcePath = this.resolvePath(source);
    const destPath = this.resolvePath(dest);
    
    try {
      await vfs.renameFile(sourcePath, destPath);
      return { output: '', exitCode: 0 };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: error instanceof Error ? error.message : 'mv failed',
      };
    }
  }

  private async touch(path: string): Promise<CommandResult> {
    if (!path) {
      return {
        output: '',
        exitCode: 1,
        error: 'touch: missing file operand',
      };
    }

    const fullPath = this.resolvePath(path);
    
    try {
      const existing = await vfs.readFile(fullPath);
      if (!existing) {
        await vfs.createFile(fullPath, '');
      }
      return { output: '', exitCode: 0 };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: error instanceof Error ? error.message : 'touch failed',
      };
    }
  }

  private async history(): Promise<CommandResult> {
    const output = this.context.history
      .map((cmd, i) => `${i + 1}  ${cmd}`)
      .join('\n') + '\n';
    return { output, exitCode: 0 };
  }

  private async env(): Promise<CommandResult> {
    const output = Object.entries(this.context.environment)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';
    return { output, exitCode: 0 };
  }

  private async help(): Promise<CommandResult> {
    const commands = `
Available commands:
  pwd               - Print working directory
  ls [options]      - List directory contents (-l for long format, -a for all)
  cd <path>         - Change directory
  cat <file>        - Display file contents
  echo <text>       - Print text to output
  mkdir <dir>       - Create directory
  rm <file>         - Remove file or directory (-r for recursive)
  mv <src> <dst>    - Move/rename file
  touch <file>      - Create empty file
  clear             - Clear terminal
  history           - Show command history
  env               - Show environment variables
  whoami            - Display current user
  help              - Show this help message
  node <file>       - Execute JavaScript file (experimental)
  npm <command>     - Run npm commands (limited)
`;
    return { output: commands, exitCode: 0 };
  }

  private async executeNode(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        output: 'Node.js REPL not yet implemented. Specify a file to execute.\n',
        exitCode: 1,
      };
    }

    const filePath = this.resolvePath(args[0]);
    
    try {
      const file = await vfs.readFile(filePath);
      
      if (!file) {
        return {
          output: '',
          exitCode: 1,
          error: `node: cannot find file '${args[0]}'`,
        };
      }

      // Simple eval execution (unsafe, for demo only)
      // In production, use WebAssembly or WebContainers
      let output = '';
      const consoleLog = (...args: unknown[]) => {
        output += args.map(String).join(' ') + '\n';
      };

      try {
        const func = new Function('console', file.content);
        func({ log: consoleLog, error: consoleLog, warn: consoleLog });
        return { output, exitCode: 0 };
      } catch (error) {
        return {
          output: '',
          exitCode: 1,
          error: error instanceof Error ? error.message : 'Execution failed',
        };
      }
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        error: `node: cannot find file '${args[0]}'`,
      };
    }
  }

  private async executeNpm(args: string[]): Promise<CommandResult> {
    const [subcommand] = args;

    switch (subcommand) {
      case 'init':
        return {
          output: 'npm init: Creating package.json...\n',
          exitCode: 0,
        };
      case 'install':
      case 'i':
        return {
          output: `npm: Installing packages...\n(Note: This is a simulated environment)\n`,
          exitCode: 0,
        };
      case 'run':
        return {
          output: `npm run: Script execution not yet implemented\n`,
          exitCode: 1,
        };
      default:
        return {
          output: `npm: command '${subcommand}' not recognized\n`,
          exitCode: 1,
        };
    }
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }

    if (path === '.') {
      return this.context.currentDirectory;
    }

    if (path === '..') {
      const parts = this.context.currentDirectory.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/');
    }

    if (path.startsWith('./')) {
      path = path.slice(2);
    }

    if (path.startsWith('../')) {
      let result = this.context.currentDirectory;
      while (path.startsWith('../')) {
        const parts = result.split('/').filter(Boolean);
        parts.pop();
        result = '/' + parts.join('/');
        path = path.slice(3);
      }
      return result + (path ? '/' + path : '');
    }

    return this.context.currentDirectory === '/' 
      ? '/' + path 
      : this.context.currentDirectory + '/' + path;
  }

  getCurrentDirectory(): string {
    return this.context.currentDirectory;
  }

  getHistory(): string[] {
    return [...this.context.history];
  }

  clearHistory(): void {
    this.context.history = [];
  }
}

export const commandProcessor = new CommandProcessor();
