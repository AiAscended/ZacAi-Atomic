# ZacAi IDE - Enterprise-Grade Integrated Development Environment

## Overview

ZacAi IDE is a production-ready, browser-based integrated development environment built with Next.js 15, React 19, and TypeScript. It provides enterprise-grade features matching GitHub Codespaces, V0.dev, and Bolt.new quality standards, with deep integration into ZacAi's hybrid LLM multi-modal AI system (23 knowledge domains, 14 AI models).

## Quick Start

### Accessing the IDE

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to:
```
http://localhost:3001/ide
```

3. The IDE will load with a comprehensive interface featuring:
   - File Explorer (left panel)
   - Code Editor (center panel)
   - Terminal (bottom panel)
   - Preview Panel (right panel)
   - AI Chat Assistant (right panel)

## Core Features

### 🗂️ Virtual File System
- **IndexedDB-powered** persistent storage
- Full CRUD operations (Create, Read, Update, Delete)
- File search and filtering
- Folder creation and management
- Drag-and-drop file organization
- Keyboard shortcuts (Ctrl+N, Ctrl+S, Ctrl+O, Delete)

### ✏️ Advanced Code Editor
- **Monaco Editor** (VSCode engine)
- Syntax highlighting for 50+ languages
- IntelliSense and auto-completion
- Multi-cursor editing
- Find/Replace with regex support
- Code folding and minimap
- Custom snippets (React, TypeScript, JavaScript)
- Keyboard shortcuts (F12 Go to Definition, F2 Rename, Ctrl+Shift+F Format)

### 🖥️ Terminal & Command Execution
- **Xterm.js** terminal emulator
- Shell command execution (20+ commands)
- Command history (Up/Down arrows)
- Environment variables
- Path resolution (absolute, relative, parent)

**Supported Commands:**
- `pwd` - Print working directory
- `ls` - List directory contents
- `cd <dir>` - Change directory
- `cat <file>` - Display file contents
- `echo <text>` - Print text
- `mkdir <dir>` - Create directory
- `rm <file>` - Remove file
- `mv <src> <dest>` - Move/rename file
- `touch <file>` - Create empty file
- `clear` - Clear terminal
- `history` - Command history
- `env` - Environment variables
- `whoami` - Current user
- `help` - Command list
- `node <file>` - Execute JavaScript
- `npm <command>` - NPM operations

### 🤖 AI Assistant Integration

Enterprise-level AI coding assistant with full IDE integration:

**AI Capabilities:**
- **Code Explanation** - Understand complex code
- **Bug Fixing** - Automated error detection and fixes
- **Code Optimization** - Performance improvements
- **Code Generation** - Create code from descriptions
- **Refactoring** - Improve code structure
- **Documentation** - Auto-generate comments and docs
- **Code Review** - Best practices analysis

**Context-Aware Features:**
- Current file content awareness
- Cursor position tracking
- Open files context
- Project structure understanding
- Multi-file analysis

**Quick Actions:**
- Explain selected code
- Generate code snippets
- Fix bugs automatically
- Optimize performance
- Refactor code structure

### 🔍 Code Preview & Execution

Sandboxed code execution environment:

**Supported Execution:**
- HTML files (with CSS/JS injection)
- JavaScript files (sandboxed console)
- React components (with Babel transformation)
- TypeScript files (transpiled execution)

**Features:**
- Live preview updates
- Console output capture
- Error handling and display
- Iframe isolation for security
- Auto-refresh on file save

### 🔗 GitHub Integration

Full GitHub repository management:

**Features:**
- Clone repositories by URL
- Browse repository structure
- Branch management
- File content viewing
- Commit history
- Pull request information
- Issue tracking

**Usage:**
1. Enter GitHub repository URL
2. Click "Clone Repository"
3. Browse files in File Explorer
4. Open files in editor
5. Make changes and commit

### ⚙️ Settings & Configuration

Comprehensive IDE customization:

**Editor Settings:**
- Font size and family
- Tab size and indentation
- Word wrap
- Minimap display
- Format on save
- Auto-save

**Theme Settings:**
- Editor theme (ZacAi Dark, VS Dark, Light)
- UI theme (Dark, Light, Auto)

**Terminal Settings:**
- Font size
- Scrollback buffer
- Cursor blink style

**AI Settings:**
- Enable/disable AI assistant
- Auto-suggestions
- Context lines
- Inline hints

**Advanced Settings:**
- Auto-save interval
- Auto-refresh preview
- Git integration toggle

**Import/Export:**
- Export settings to JSON
- Import settings from file
- Reset to defaults

## Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 15.5.6 |
| UI Library | React | 19.0.0 |
| Language | TypeScript | 5.7.3 |
| Editor | Monaco Editor | 4.6.0 |
| Terminal | Xterm.js | 5.5.0 |
| State Management | Zustand | 5.0.2 |
| Storage | IndexedDB (idb) | 8.0.2 |
| GitHub API | Octokit | Latest |
| UI Components | Radix UI | Latest |
| Styling | Tailwind CSS | 3.4.1 |

### File Structure

```
src/
├── app/
│   └── ide/
│       ├── page.tsx                    # Main IDE page
│       └── components/
│           ├── FileExplorer.tsx        # File tree navigation
│           ├── EditorPanel.tsx         # Monaco editor wrapper
│           ├── TerminalPanel.tsx       # Terminal with command execution
│           ├── PreviewPanel.tsx        # Code preview/execution
│           ├── AIChatPanel.tsx         # AI assistant interface
│           ├── GitHubPanel.tsx         # GitHub integration UI
│           └── IDESettingsPanel.tsx    # Settings dialog
│
├── lib/
│   └── ide/
│       ├── fileSystem.ts               # Virtual file system (IndexedDB)
│       ├── editorStore.ts              # Editor state management
│       ├── terminalStore.ts            # Terminal state management
│       ├── previewStore.ts             # Preview panel state
│       ├── commandProcessor.ts         # Shell command execution
│       ├── aiIDEIntegration.ts         # AI service layer
│       ├── monacoConfig.ts             # Editor configuration
│       ├── codeExecutionService.ts     # Code execution engine
│       ├── ideSettings.ts              # Settings store
│       └── githubIntegration.ts        # GitHub API client
│
└── docs/
    ├── IDE_IMPLEMENTATION_STATUS.md    # Implementation progress
    ├── IDE_INTEGRATION_PLAN.md         # Original implementation plan
    └── IDE_README.md                   # This file
```

### System Integration

#### State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Zustand Store Layer                      │
├─────────────────────────────────────────────────────────────┤
│  editorStore  │  terminalStore  │  previewStore  │  ideSettings │
└────────┬──────────────┬───────────────┬──────────────┬──────┘
         │              │               │              │
         ▼              ▼               ▼              ▼
┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   Monaco    │  │  Xterm   │  │  Preview │  │ Settings │
│   Editor    │  │ Terminal │  │  Iframe  │  │  Dialog  │
└─────────────┘  └──────────┘  └──────────┘  └──────────┘
```

#### Data Persistence

```
┌───────────────────────────────────────────────────────┐
│                   Persistence Layer                    │
├───────────────────────────────────────────────────────┤
│                                                        │
│  IndexedDB (idb)              localStorage            │
│  ├── files/                   ├── ide-settings        │
│  ├── folders/                 └── editor-state        │
│  └── metadata/                                        │
│                                                        │
└───────────────────────────────────────────────────────┘
```

#### AI Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Chat Panel (UI)                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              AI IDE Integration Service                  │
│  ├── Context Builder (file, cursor, open files)        │
│  ├── Action Handler (explain, fix, optimize, etc)      │
│  └── Response Parser (code blocks, actions)            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   ZacAi API (/api/chat)                  │
│  ├── 23 Knowledge Domains                               │
│  ├── 14 AI Models (GPT-4, Claude, Gemini, etc)         │
│  └── Multi-modal Processing                             │
└─────────────────────────────────────────────────────────┘
```

#### Code Execution Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Editor Panel                          │
│                   (User edits code)                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Code Execution Service                      │
│  ├── executeHTML()      - Full HTML rendering           │
│  ├── executeJavaScript() - Sandboxed JS execution       │
│  ├── executeReact()     - React component rendering     │
│  └── executeFromVFS()   - VFS file execution            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Preview Panel (Iframe)                  │
│  ├── Sandboxed execution environment                    │
│  ├── Console capture (postMessage)                      │
│  ├── Error handling                                     │
│  └── Live output display                                │
└─────────────────────────────────────────────────────────┘
```

## Usage Examples

### Example 1: Create and Execute a React Component

1. **Create a new file:**
   - Click "New File" in File Explorer
   - Name it `HelloWorld.tsx`

2. **Write React component:**
```tsx
import React from 'react';

export default function HelloWorld() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Hello from ZacAi IDE!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

3. **Preview the component:**
   - Click "Preview" tab
   - Component renders live with full interactivity

### Example 2: Use AI Assistant for Code Review

1. **Select code in editor**

2. **Open AI Chat Panel**

3. **Click "Code Review" or type:**
```
Review this code for best practices and potential issues
```

4. **AI responds with:**
   - Code quality analysis
   - Security concerns
   - Performance suggestions
   - Best practice recommendations

### Example 3: Clone and Edit GitHub Repository

1. **Open GitHub Panel**

2. **Enter repository URL:**
```
https://github.com/username/repository
```

3. **Click "Clone Repository"**

4. **Browse files in File Explorer:**
   - Files appear with GitHub icon
   - Click to open in editor

5. **Edit and preview:**
   - Make changes in editor
   - Preview updates automatically

### Example 4: Terminal Workflow

1. **Open Terminal Panel**

2. **Create project structure:**
```bash
mkdir my-project
cd my-project
mkdir src
mkdir public
touch src/index.js
```

3. **Create a file:**
```bash
echo "console.log('Hello World')" > src/index.js
```

4. **View file contents:**
```bash
cat src/index.js
```

5. **Execute code:**
```bash
node src/index.js
```

### Example 5: AI-Powered Code Generation

1. **Open AI Chat Panel**

2. **Describe what you need:**
```
Generate a TypeScript function that fetches user data from an API 
with error handling and loading states
```

3. **AI generates complete code:**
```typescript
async function fetchUserData(userId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ... complete implementation with error handling
}
```

4. **Click "Insert to Editor"**

5. **Code appears in active file**

## Keyboard Shortcuts

### Editor
- `Ctrl+N` - New file
- `Ctrl+S` - Save file
- `Ctrl+O` - Open file
- `Ctrl+F` - Find
- `Ctrl+H` - Replace
- `Ctrl+/` - Toggle comment
- `Ctrl+Shift+F` - Format document
- `F12` - Go to definition
- `F2` - Rename symbol
- `Alt+Up/Down` - Move line up/down
- `Ctrl+D` - Add selection to next find match
- `Ctrl+Shift+K` - Delete line

### Terminal
- `Enter` - Execute command
- `Ctrl+C` - Cancel current input
- `Ctrl+L` - Clear terminal
- `Up/Down` - Command history
- `Tab` - (Future: Auto-complete)

### File Explorer
- `Delete` - Delete selected file
- `F2` - Rename file
- `Ctrl+Click` - Open in new tab (future)

## Configuration

### Custom Themes

Edit `src/lib/ide/monacoConfig.ts` to add custom themes:

```typescript
monaco.editor.defineTheme('myCustomTheme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' },
    // ... custom token colors
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    // ... custom editor colors
  }
});
```

### Custom Snippets

Add snippets in `monacoConfig.ts`:

```typescript
monaco.languages.registerCompletionItemProvider('typescript', {
  provideCompletionItems: () => {
    return {
      suggestions: [
        {
          label: 'mysnippet',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'my custom code template',
          documentation: 'My custom snippet'
        }
      ]
    };
  }
});
```

### AI Model Selection

Currently uses ZacAi's hybrid LLM system automatically. To customize AI behavior, modify `src/lib/ide/aiIDEIntegration.ts`:

```typescript
private async callZacAiAPI(messages: any[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: 'gpt-4', // Change preferred model
      domain: 'code-generation', // Specify knowledge domain
      // ... other options
    })
  });
}
```

## Performance Optimization

### Virtual File System
- IndexedDB provides instant access to files
- No network latency for local operations
- Automatic batching of write operations
- Lazy loading of file contents

### Editor Performance
- Monaco Editor uses web workers for syntax highlighting
- Virtual scrolling for large files
- Incremental parsing for IntelliSense
- Debounced save operations

### Terminal Performance
- Xterm.js renders only visible lines
- Virtual scrolling for command history
- Command execution in separate thread
- Output truncation for large results

### Preview Performance
- Iframe isolation prevents main thread blocking
- Debounced code execution (300ms)
- Cached execution results
- Automatic cleanup of old iframes

## Security Considerations

### Code Execution Sandbox
- All code runs in iframe with `sandbox` attribute
- No direct access to parent window
- postMessage communication only
- CSP headers prevent XSS

### File System Security
- IndexedDB isolated per domain
- No direct file system access
- Validation on all file operations
- Size limits on uploads

### API Security
- All API calls authenticated
- CORS protection
- Rate limiting on AI requests
- Input sanitization

## Troubleshooting

### IDE Won't Load
1. Check browser console for errors
2. Verify `npm run dev` is running
3. Clear browser cache and reload
4. Check IndexedDB is enabled in browser

### Files Not Saving
1. Check browser storage quota
2. Open DevTools → Application → IndexedDB
3. Verify `ide-filesystem` database exists
4. Check for storage permission errors

### Terminal Commands Not Working
1. Verify command exists in `commandProcessor.ts`
2. Check working directory with `pwd`
3. Verify file paths are correct
4. Check browser console for errors

### AI Assistant Not Responding
1. Check `/api/chat` endpoint is running
2. Verify API keys are configured
3. Check network tab for failed requests
4. Review console for error messages

### Preview Not Updating
1. Check for JavaScript errors in preview
2. Verify file type is supported (HTML/JS/React)
3. Check previewStore.autoRefresh is enabled
4. Try manual refresh button

### TypeScript Errors in Console
Some non-blocking TypeScript errors may appear:
- Monaco API type mismatches (cosmetic)
- React import warnings (runtime works)
- Octokit type guards (functionality intact)

These don't affect IDE functionality and will be addressed in future updates.

## Development Roadmap

### Completed (v1.0)
✅ Virtual file system with IndexedDB
✅ Monaco code editor integration
✅ Terminal with command execution
✅ AI assistant with context awareness
✅ GitHub repository integration
✅ Code preview and execution
✅ Settings persistence
✅ Advanced editor features

### Planned (v1.1)
🔲 Multi-file search and replace
🔲 Git operations (commit, push, pull)
🔲 Collaborative editing (WebRTC)
🔲 Extension system
🔲 Custom keybinding editor
🔲 Workspace templates

### Planned (v1.2)
🔲 Debugger integration
🔲 Test runner integration
🔲 Performance profiler
🔲 Docker container support
🔲 SSH remote connection
🔲 Mobile responsive layout

## API Reference

### Virtual File System

```typescript
// Get file system instance
const vfs = virtualFileSystem;

// Create file
await vfs.createFile({
  name: 'example.ts',
  path: '/src',
  content: 'console.log("Hello");',
  type: 'file'
});

// Read file
const file = await vfs.getFile('file-id');

// Update file
await vfs.updateFile('file-id', {
  content: 'console.log("Updated");'
});

// Delete file
await vfs.deleteFile('file-id');

// List files
const files = await vfs.listFiles('/src');

// Search files
const results = await vfs.searchFiles('component');
```

### Editor Store

```typescript
import { useEditorStore } from '@/lib/ide/editorStore';

// In component
const { 
  currentFile,
  openFile,
  closeFile,
  updateContent,
  isDirty 
} = useEditorStore();

// Open file
openFile({
  id: 'file-id',
  name: 'example.ts',
  content: 'code here',
  language: 'typescript'
});

// Update content
updateContent('updated code');

// Close file
closeFile('file-id');
```

### AI Integration

```typescript
import { useAIIDE } from '@/lib/ide/aiIDEIntegration';

// In component
const ai = useAIIDE();

// Explain code
const explanation = await ai.explainCode('function example() {}');

// Fix code
const fixed = await ai.fixCode('code with errors');

// Generate code
const generated = await ai.generateCode(
  'Create a React component that displays a user profile'
);

// Code review
const review = await ai.codeReview('function to review() {}');
```

### Code Execution

```typescript
import { codeExecutionService } from '@/lib/ide/codeExecutionService';

// Execute HTML
await codeExecutionService.executeHTML(
  '<h1>Hello</h1>',
  'body { margin: 0; }',
  'console.log("Hi");'
);

// Execute JavaScript
await codeExecutionService.executeJavaScript(
  'console.log("Hello World");'
);

// Execute React
await codeExecutionService.executeReact(`
  export default function App() {
    return <div>Hello</div>;
  }
`);
```

### Settings Store

```typescript
import { useIDESettings } from '@/lib/ide/ideSettings';

// In component
const { 
  settings,
  updateEditorSettings,
  updateThemeSettings,
  exportSettings,
  importSettings,
  resetSettings
} = useIDESettings();

// Update editor settings
updateEditorSettings({
  fontSize: 16,
  tabSize: 4
});

// Export settings
const json = exportSettings();

// Import settings
importSettings(jsonString);

// Reset to defaults
resetSettings();
```

## Contributing

### Development Setup

1. **Clone repository:**
```bash
git clone https://github.com/AiAscended/ZacAi-Atomic.git
cd ZacAi-Atomic
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open IDE:**
```
http://localhost:3001/ide
```

### Code Style

- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- 2-space indentation
- Single quotes for strings
- Trailing commas in multi-line

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Building for Production

```bash
# Build application
npm run build

# Start production server
npm start
```

## Support

### Documentation
- Implementation Status: `/docs/IDE_IMPLEMENTATION_STATUS.md`
- Integration Plan: `/docs/IDE_INTEGRATION_PLAN.md`
- API Documentation: `/docs/API.md`

### Community
- GitHub Issues: https://github.com/AiAscended/ZacAi-Atomic/issues
- Discussions: https://github.com/AiAscended/ZacAi-Atomic/discussions

### Contact
- Project Lead: AiAscended
- Repository: https://github.com/AiAscended/ZacAi-Atomic

## License

See LICENSE file in repository root.

## Acknowledgments

Built with:
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Microsoft's VSCode editor engine
- [Xterm.js](https://xtermjs.org/) - Terminal emulator
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [idb](https://github.com/jakearchibald/idb) - IndexedDB wrapper
- [Octokit](https://github.com/octokit/octokit.js) - GitHub API client
- [Next.js](https://nextjs.org/) - React framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**ZacAi IDE v1.0** - Enterprise-Grade Browser-Based Development Environment

Last Updated: November 5, 2025
