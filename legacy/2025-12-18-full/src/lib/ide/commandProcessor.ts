import { vfs } from "./virtualFileSystem";

export interface CommandResult {
  output: string;
  exitCode: number;
  error?: string;
}

export interface CommandContext {
  fs: CommandFileSystem;
  currentPath: string;
  environment: Record<string, string>;
}

class CommandProcessor {
  private context: CommandContext = {
    currentDirectory: "/",
    environment: {
      HOME: "/",
      USER: "zacai",
      PATH: "/usr/local/bin:/usr/bin:/bin",
      SHELL: "/bin/bash",
      TERM: "xterm-256color",
    },
    history: [],
  };
}

  async executeCommand(command: string): Promise<CommandResult> {
    const trimmedCommand = command.trim();

    if (!trimmedCommand) {
      return { output: "", exitCode: 0 };
    }

    // Add to history
    this.commandHistory.push(commandLine);
    this.historyIndex = this.commandHistory.length;

    // Parse command
    const parts = this.parseCommand(commandLine);
    const command = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case "pwd":
          return await this.pwd();
        case "ls":
          return await this.ls(args);
        case "cd":
          return await this.cd(args[0] || "/");
        case "cat":
          return await this.cat(args[0]);
        case "echo":
          return await this.echo(args.join(" "));
        case "mkdir":
          return await this.mkdir(args[0]);
        case "rm":
          return await this.rm(args);
        case "mv":
          return await this.mv(args[0], args[1]);
        case "touch":
          return await this.touch(args[0]);
        case "clear":
          return { output: "\x1b[2J\x1b[H", exitCode: 0 };
        case "history":
          return await this.history();
        case "env":
          return await this.env();
        case "whoami":
          return { output: this.context.environment.USER + "\n", exitCode: 0 };
        case "help":
          return await this.help();
        case "node":
          return await this.executeNode(args);
        case "npm":
          return await this.executeNpm(args);
        default:
          return {
            output: `bash: ${command}: command not found\n`,
            exitCode: 127,
            error: "Command not found",
          };
      }
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private parseCommand(command: string): string[] {
    // Simple parsing - split by spaces, respecting quotes
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < command.length; i++) {
      const char = command[i];

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = "";
      } else if (char === " " && !inQuotes) {
        if (current) {
          parts.push(current);
          current = "";
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
      output: this.context.currentDirectory + "\n",
      exitCode: 0,
    };
  }

  private async ls(args: string[]): Promise<CommandResult> {
    const showAll = args.includes("-a") || args.includes("--all");
    const longFormat = args.includes("-l") || args.includes("--long");

    const path =
      args.find((arg) => !arg.startsWith("-")) || this.context.currentDirectory;
    const fullPath = this.resolvePath(path);

    try {
      const files = await vfs.listDirectory(fullPath);

      if (files.length === 0) {
        return { output: "", exitCode: 0 };
      }

      let output = "";

      if (longFormat) {
        for (const file of files) {
          const type = file.type === "directory" ? "d" : "-";
          const perms = file.type === "directory" ? "rwxr-xr-x" : "rw-r--r--";
          const size = file.size.toString().padStart(8);
          const date = new Date(file.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          const name = file.path.split("/").pop();
          output += `${type}${perms} 1 ${this.context.environment.USER} ${size} ${date} ${name}\n`;
        }
      } else {
        const names = files.map((f) => {
          const name = f.path.split("/").pop() || "";
          return f.type === "directory" ? `\x1b[34m${name}/\x1b[0m` : name;
        });
        output = names.join("  ") + "\n";
      }

      return { output, exitCode: 0 };
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: `ls: cannot access '${path}': No such file or directory`,
      };
    }
  }

  private async cd(path: string): Promise<CommandResult> {
    if (!path || path === "~") {
      this.context.currentDirectory = this.context.environment.HOME;
      return { output: "", exitCode: 0 };
    }

    const fullPath = this.resolvePath(path);

    try {
      const file = await vfs.readFile(fullPath);

      if (!file) {
        return {
          output: "",
          exitCode: 1,
          error: `cd: no such file or directory: ${path}`,
        };
      }

      if (file.type !== "directory") {
        return {
          output: "",
          exitCode: 1,
          error: `cd: not a directory: ${path}`,
        };
      }

      this.context.currentDirectory = fullPath;
      return { output: "", exitCode: 0 };
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: `cd: no such file or directory: ${path}`,
      };
    }
  }

  private async cat(path: string): Promise<CommandResult> {
    if (!path) {
      return {
        output: "",
        exitCode: 1,
        error: "cat: missing file operand",
      };
    }

    const fullPath = this.resolvePath(path);

    try {
      const file = await vfs.readFile(fullPath);

      if (!file) {
        return {
          output: "",
          exitCode: 1,
          error: `cat: ${path}: No such file or directory`,
        };
      }

      if (file.type === "directory") {
        return {
          output: "",
          exitCode: 1,
          error: `cat: ${path}: Is a directory`,
        };
      }

      return { output: file.content + "\n", exitCode: 0 };
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: `cat: ${path}: No such file or directory`,
      };
    }
  }

  private async echo(text: string): Promise<CommandResult> {
    return { output: text + "\n", exitCode: 0 };
  }

  private async mkdir(path: string): Promise<CommandResult> {
    if (!path) {
      return {
        output: "",
        exitCode: 1,
        error: "mkdir: missing operand",
      };
    }

    const fullPath = this.resolvePath(path);

    try {
      await vfs.createDirectory(fullPath);
      return { output: "", exitCode: 0 };
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: error instanceof Error ? error.message : "mkdir failed",
      };
    }
  }

  private async rm(args: string[]): Promise<CommandResult> {
    const recursive = args.includes("-r") || args.includes("-rf");
    const path = args.find((arg) => !arg.startsWith("-"));

    if (!path) {
      return {
        output: "",
        exitCode: 1,
        error: "rm: missing operand",
      };
    }

    const fullPath = this.resolvePath(path);

    try {
      const file = await vfs.readFile(fullPath);

      if (!file) {
        return {
          output: "",
          exitCode: 1,
          error: `rm: cannot remove '${path}': No such file or directory`,
        };
      }

      if (file.type === "directory" && !recursive) {
        return {
          output: "",
          exitCode: 1,
          error: `rm: cannot remove '${path}': Is a directory`,
        };
      }

      await vfs.deleteFile(fullPath);
      return { output: "", exitCode: 0 };
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: error instanceof Error ? error.message : "rm failed",
      };
    }
  }

  private async mv(source: string, dest: string): Promise<CommandResult> {
    if (!source || !dest) {
      return {
        output: "",
        exitCode: 1,
        error: "mv: missing file operand",
      };
    }

    const sourcePath = this.resolvePath(source);
    const destPath = this.resolvePath(dest);

    try {
      await vfs.renameFile(sourcePath, destPath);
      return { output: "", exitCode: 0 };
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: error instanceof Error ? error.message : "mv failed",
      };
    }
  }

  private async touch(path: string): Promise<CommandResult> {
    if (!path) {
      return {
        output: "",
        exitCode: 1,
        error: "touch: missing file operand",
      };
    }

    const fullPath = this.resolvePath(path);

    try {
      const existing = await vfs.readFile(fullPath);
      if (!existing) {
        await vfs.createFile(fullPath, "");
      }
      return { output: "", exitCode: 0 };
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: error instanceof Error ? error.message : "touch failed",
      };
    }
  }

  private async history(): Promise<CommandResult> {
    const output =
      this.context.history.map((cmd, i) => `${i + 1}  ${cmd}`).join("\n") +
      "\n";
    return { output, exitCode: 0 };
  }

  private async env(): Promise<CommandResult> {
    const output =
      Object.entries(this.context.environment)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n") + "\n";
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
        output:
          "Node.js REPL not yet implemented. Specify a file to execute.\n",
        exitCode: 1,
      };
    }

    const filePath = this.resolvePath(args[0]);

    try {
      const file = await vfs.readFile(filePath);

      if (!file) {
        return {
          output: "",
          exitCode: 1,
          error: `node: cannot find file '${args[0]}'`,
        };
      }

      // Simple eval execution (unsafe, for demo only)
      // In production, use WebAssembly or WebContainers
      let output = "";
      const consoleLog = (...args: any[]) => {
        output += args.map(String).join(" ") + "\n";
      };

      try {
        const func = new Function("console", file.content);
        func({ log: consoleLog, error: consoleLog, warn: consoleLog });
        return { output, exitCode: 0 };
      } catch (error) {
        return {
          output: "",
          exitCode: 1,
          error: error instanceof Error ? error.message : "Execution failed",
        };
      }
    } catch (error) {
      return {
        output: "",
        exitCode: 1,
        error: `node: cannot find file '${args[0]}'`,
      };
    }
  }

  private async executeNpm(args: string[]): Promise<CommandResult> {
    const [subcommand] = args;

    switch (subcommand) {
      case "init":
        return {
          output: "npm init: Creating package.json...\n",
          exitCode: 0,
        };
      case "install":
      case "i":
        return {
          output: `npm: Installing packages...\n(Note: This is a simulated environment)\n`,
          exitCode: 0,
        };
      case "run":
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
    if (path.startsWith("/")) {
      return path;
    }

    if (path === ".") {
      return this.context.currentDirectory;
    }

    if (path === "..") {
      const parts = this.context.currentDirectory.split("/").filter(Boolean);
      parts.pop();
      return "/" + parts.join("/");
    }

    if (path.startsWith("./")) {
      path = path.slice(2);
    }

    if (path.startsWith("../")) {
      let result = this.context.currentDirectory;
      while (path.startsWith("../")) {
        const parts = result.split("/").filter(Boolean);
        parts.pop();
        result = "/" + parts.join("/");
        path = path.slice(3);
      }
      return result + (path ? "/" + path : "");
    }

    return this.context.currentDirectory === "/"
      ? "/" + path
      : this.context.currentDirectory + "/" + path;
  }

  private async handleLs(args: string[]): Promise<CommandResult> {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
    const path = args.find((arg) => !arg.startsWith('-')) || this.context.currentPath;
    const resolvedPath = this.resolvePath(path);

    try {
      const items = await this.context.fs.list(resolvedPath);
      const visibleItems = showAll
        ? items
        : items.filter((item) => !item.name.startsWith('.'));
      
      if (visibleItems.length === 0) {
        return { output: '', exitCode: 0 };
      }

      let output = '';
      if (longFormat) {
        for (const item of visibleItems) {
          const type = item.type === 'directory' ? 'd' : '-';
          const perms = 'rwxr-xr-x';
          const size = item.metadata?.size || 0;
          const date = item.metadata?.modified
            ? new Date(item.metadata.modified).toLocaleDateString()
            : 'Unknown';
          output += `${type}${perms} 1 zacai zacai ${size.toString().padStart(8)} ${date} ${item.name}\n`;
        }
      } else {
        output = visibleItems.map((item) => item.name).join('  ') + '\n';
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
      const exists = await this.context.fs.exists(resolvedPath);
      if (!exists) {
        return {
          output: `cd: ${path}: No such file or directory\n`,
          exitCode: 1,
          error: 'Directory not found',
        };
      }

      // Check if it's a directory
      const items = await this.context.fs.list(resolvedPath.split('/').slice(0, -1).join('/') || '/');
      const item = items.find((i) => i.path === resolvedPath);
      
      if (item && item.type !== 'directory') {
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
        const content = await this.context.fs.read(path);
        output += content + '\n';
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
        await this.context.fs.mkdir(path);
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
        const exists = await this.context.fs.exists(path);
        if (!exists) {
          await this.context.fs.write(path, '');
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
        if (!recursive) {
          const parentPath = path.split('/').slice(0, -1).join('/') || '/';
          try {
            const siblings = await this.context.fs.list(parentPath);
            const target = siblings.find((entry) => entry.path === path);
            if (target?.type === 'directory') {
              return {
                output: `rm: cannot remove '${file}': Is a directory\n`,
                exitCode: 1,
                error: 'Is a directory',
              };
            }
          } catch {
            // Ignore parent listing errors and attempt deletion
          }
        }

        await this.context.fs.delete(path);
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
        const items = await this.context.fs.list(dirPath);
        items.sort((a, b) => {
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
      const results = await this.context.fs.search(searchTerm);
      const output = results.map((r) => r.path).join('\n') + (results.length > 0 ? '\n' : '');
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
      const content = await this.context.fs.read(filePath);
      const lines = content.split('\n');
      const matches = lines.filter((line) => line.includes(pattern));
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
