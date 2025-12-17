# ZacAi IDE Integration - Comprehensive Development Plan

**Version:** 1.0  
**Date:** November 5, 2025  
**Status:** Planning → Implementation  
**Target:** Production-Grade CodeSpaces/V0.dev-style IDE Integration

---

## 🎯 Executive Summary

Create a lightweight, browser-based IDE integrated into the ZacAi-Atomic system that replicates GitHub Codespaces functionality with V0.dev polish. The IDE will enable:
- Real-time code editing with syntax highlighting
- Code execution in WebAssembly containers
- GitHub repository integration
- AI-assisted coding with ZacAi-Hybrid-LLM
- Split-panel interface (Files | Editor | Preview | Terminal | AI Chat)
- Code snippet preview and editing from AI responses

---

## 📋 Phase 1: Architecture & Technology Stack

### Core Technologies
- **Frontend Framework:** Next.js 15 + React 19
- **Code Editor:** Monaco Editor (VSCode engine)
- **Terminal:** Xterm.js
- **Code Execution:** WebAssembly + WebContainers (StackBlitz technology)
- **File System:** Browser FS API + Virtual File System
- **Syntax Highlighting:** Prism.js (already installed) + Monaco themes
- **GitHub Integration:** Octokit (already installed)
- **UI Components:** Radix UI (already installed) + Tailwind CSS
- **State Management:** React Context + Zustand (lightweight)

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                   IDE Layout Manager                     │
│  ┌─────────┬──────────┬─────────┬──────────┬─────────┐ │
│  │  Files  │  Editor  │ Preview │ Terminal │AI Chat  │ │
│  │  Tree   │  Monaco  │ Browser │ Xterm.js │ ZacAi   │ │
│  └─────────┴──────────┴─────────┴──────────┴─────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
    ┌──────▼──────┐               ┌───────▼────────┐
    │   Execution │               │    GitHub      │
    │   Engine    │               │  Integration   │
    │ (WebAssembly│               │   (Octokit)    │
    │  Container) │               └────────────────┘
    └─────────────┘
           │
    ┌──────▼──────────────┐
    │  Virtual File System │
    │  (Browser IndexedDB) │
    └─────────────────────┘
```

---

## 📋 Phase 2: Feature Specifications

### 2.1 File Explorer Panel
- **Tree View:** Hierarchical file/folder display
- **Operations:** Create, rename, delete, move files
- **Search:** Quick file finder (Cmd/Ctrl+P)
- **GitHub Sync:** Pull/push from connected repositories
- **File Icons:** Type-specific icons (React, TypeScript, JSON, etc.)
- **Drag & Drop:** File reordering and moving

### 2.2 Code Editor Panel (Monaco)
- **Multi-Tab Support:** Open multiple files
- **Syntax Highlighting:** All major languages
- **IntelliSense:** Auto-completion for TypeScript/JavaScript
- **Bracket Matching:** Auto-close brackets, quotes
- **Mini-map:** Code overview sidebar
- **Line Numbers:** With folding support
- **Themes:** Dark/Light mode sync with system theme
- **Keyboard Shortcuts:** VSCode-compatible
- **Find & Replace:** With regex support
- **Git Diff:** Inline change indicators

### 2.3 Preview Panel
- **Live Preview:** Real-time HTML/CSS/JS rendering
- **Hot Reload:** Auto-refresh on file save
- **Responsive View:** Mobile/tablet/desktop toggles
- **Console Output:** JavaScript console logs
- **Error Display:** Runtime error overlay
- **iframe Sandbox:** Secure code execution
- **WebAssembly Support:** Run compiled code

### 2.4 Terminal Panel (Xterm.js)
- **Shell Emulation:** Bash-like command interface
- **Command History:** Up/down arrow navigation
- **Multi-Terminal:** Create multiple terminal instances
- **Clear/Reset:** Terminal controls
- **Copy/Paste:** Clipboard integration
- **Resizable:** Adjust terminal height
- **Tab Support:** Multiple terminal tabs

### 2.5 AI Chat Panel (ZacAi Integration)
- **Chat Interface:** Same as main ZacAi chat
- **Code Actions:**
  - "Copy to Clipboard"
  - "Open in Editor"
  - "Preview File"
  - "Create New File"
- **Context Awareness:** Current file/project context
- **Inline Suggestions:** AI code suggestions in editor
- **Code Generation:** Generate files from descriptions
- **Code Review:** AI-powered code analysis

### 2.6 Layout Management
- **Window Controls:**
  - Minimize: Collapse to icon bar
  - Maximize: Full-screen mode
  - Close: Hide panel
  - Restore: Return to previous size
- **Resizable Panels:** Drag dividers to resize
- **Panel Positions:** Configurable layout
- **Layout Presets:**
  - Default: All panels visible
  - Focus Mode: Editor only
  - Development: Files + Editor + Terminal
  - Review: Editor + Preview + AI Chat
  - Full IDE: All panels visible
- **Saved Layouts:** User preferences stored

---

## 📋 Phase 3: Implementation Roadmap

### Sprint 1: Core Infrastructure (Week 1)
**Goal:** Set up IDE foundation and layout system

#### Tasks:
1. ✅ **Create IDE directory structure**
   ```
   src/app/ide/
   ├── page.tsx (main IDE page)
   ├── layout.tsx (IDE-specific layout)
   └── components/
       ├── IDELayout.tsx (main layout manager)
       ├── PanelContainer.tsx (resizable panels)
       ├── WindowControls.tsx (min/max/close buttons)
       └── LayoutManager.tsx (save/load layouts)
   ```

2. ✅ **Install required dependencies**
   ```bash
   npm install @monaco-editor/react xterm xterm-addon-fit xterm-addon-web-links
   npm install @webcontainer/api zustand idb
   npm install react-resizable-panels (already installed)
   ```

3. ✅ **Create layout state management**
   - Zustand store for panel visibility
   - Panel size persistence
   - Layout preset system

4. ✅ **Build responsive grid system**
   - CSS Grid-based layout
   - Panel resize handlers
   - Collapse/expand animations

**Deliverable:** Working IDE shell with resizable panels

---

### Sprint 2: Code Editor Integration (Week 1-2)
**Goal:** Integrate Monaco Editor with full features

#### Tasks:
1. ✅ **Monaco Editor component**
   - Multi-file tab system
   - Language auto-detection
   - Theme synchronization
   - Keyboard shortcuts

2. ✅ **File operations**
   - Open/save/close files
   - Unsaved changes indicator
   - Auto-save functionality

3. ✅ **Editor features**
   - IntelliSense configuration
   - Snippet support
   - Format on save
   - Bracket matching

4. ✅ **Editor settings panel**
   - Font size adjustment
   - Tab size configuration
   - Minimap toggle
   - Line numbers toggle

**Deliverable:** Fully functional code editor

---

### Sprint 3: File System & GitHub Integration (Week 2)
**Goal:** Implement virtual file system and GitHub connectivity

#### Tasks:
1. ✅ **Virtual File System**
   - IndexedDB-backed storage
   - CRUD operations
   - File/folder hierarchy
   - Search functionality

2. ✅ **File Explorer component**
   - Tree view with icons
   - Context menu (right-click)
   - Drag & drop
   - File search

3. ✅ **GitHub integration**
   - OAuth authentication (use existing system)
   - Repository browser
   - Clone repository
   - Pull/push changes
   - Commit & push UI

4. ✅ **File sync system**
   - Auto-save to IndexedDB
   - GitHub sync status indicators
   - Conflict resolution UI

**Deliverable:** Working file system with GitHub sync

---

### Sprint 4: Terminal & Code Execution (Week 2-3)
**Goal:** Add terminal and WebAssembly execution

#### Tasks:
1. ✅ **Terminal component (Xterm.js)**
   - Shell emulation
   - Command history
   - Multiple terminal tabs
   - Terminal theming

2. ✅ **Command processor**
   - Basic commands: ls, cd, pwd, cat, mkdir, rm
   - npm/node command simulation
   - File system integration
   - Command aliases

3. ✅ **WebAssembly execution engine**
   - WebContainers setup
   - JavaScript/TypeScript execution
   - Package installation simulation
   - Build process simulation

4. ✅ **Preview iframe**
   - Sandboxed execution
   - Console redirection
   - Error handling
   - Hot reload

**Deliverable:** Terminal and code execution working

---

### Sprint 5: AI Chat Integration (Week 3)
**Goal:** Integrate ZacAi-Hybrid-LLM into IDE

#### Tasks:
1. ✅ **AI Chat panel**
   - Use existing chat components
   - Context-aware prompts
   - Code action buttons

2. ✅ **Code extraction from responses**
   - Detect code blocks in AI responses
   - Syntax highlighting in chat
   - Action buttons on code blocks

3. ✅ **IDE-specific AI features**
   - "Explain this code"
   - "Fix this error"
   - "Optimize this function"
   - "Generate tests"
   - "Add documentation"

4. ✅ **Inline AI suggestions**
   - Copilot-style inline completions
   - Suggestion hotkey (Tab to accept)
   - Multi-line suggestions

**Deliverable:** AI-powered coding assistance

---

### Sprint 6: Admin Interface & Settings (Week 3-4)
**Goal:** Create admin controls for IDE

#### Tasks:
1. ✅ **IDE settings page**
   ```
   src/app/admin/ide-settings/page.tsx
   ```
   - Editor preferences
   - Layout presets
   - GitHub connections
   - AI model selection
   - Execution limits

2. ✅ **Model layers management**
   ```
   src/app/admin/models/page.tsx (enhance existing)
   ```
   - Tabbed interface for model categories:
     - Core Models (Orchestrator, Router, etc.)
     - Domain Models (one per domain)
     - Specialized Models (CNN, RNN, GAN, etc.)
   - Individual model settings pages
   - Model performance metrics
   - Enable/disable models

3. ✅ **IDE access controls**
   - User permissions
   - Repository access management
   - Execution limits per user
   - Resource quotas

**Deliverable:** Complete admin interface

---

### Sprint 7: Testing & Optimization (Week 4)
**Goal:** Comprehensive testing and performance optimization

#### Tasks:
1. ✅ **Create test suites**
   ```
   src/ai/__tests__/
   ├── ide-integration.test.ts
   ├── file-system.test.ts
   ├── code-execution.test.ts
   ├── github-integration.test.ts
   └── ai-chat-ide.test.ts
   ```

2. ✅ **Performance optimization**
   - Lazy loading of IDE components
   - Virtual scrolling for file tree
   - Code splitting for Monaco
   - WebWorker for heavy operations

3. ✅ **Security hardening**
   - Sandbox validation
   - XSS prevention in preview
   - Rate limiting on execution
   - GitHub token security

4. ✅ **Browser compatibility**
   - Test on Chrome, Firefox, Safari, Edge
   - Mobile responsiveness
   - Accessibility improvements

**Deliverable:** Production-ready IDE

---

## 📋 Phase 4: Technical Implementation Details

### 4.1 File System Architecture

```typescript
// src/lib/ide/fileSystem.ts
interface VirtualFileSystem {
  root: FileNode;
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileNode[]>;
  mkdir(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  metadata: {
    created: Date;
    modified: Date;
    size: number;
  };
}
```

### 4.2 WebAssembly Execution

```typescript
// src/lib/ide/executionEngine.ts
class CodeExecutor {
  private webcontainer: WebContainer;
  
  async initialize() {
    this.webcontainer = await WebContainer.boot();
  }
  
  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    // Mount virtual file system
    // Execute code in isolated environment
    // Capture stdout/stderr
    // Return results with console output
  }
  
  async installPackage(packageName: string): Promise<void> {
    // npm install simulation
  }
}
```

### 4.3 GitHub Integration

```typescript
// src/lib/ide/githubIntegration.ts
class GitHubManager {
  private octokit: Octokit;
  
  async cloneRepository(owner: string, repo: string): Promise<void> {
    // Fetch repository contents
    // Populate virtual file system
  }
  
  async commitChanges(message: string, files: ChangedFile[]): Promise<void> {
    // Create commit via GitHub API
  }
  
  async pushChanges(): Promise<void> {
    // Push to remote
  }
  
  async syncStatus(): Promise<SyncStatus> {
    // Check for conflicts
    // Return sync state
  }
}
```

### 4.4 AI Integration

```typescript
// src/lib/ide/aiIntegration.ts
interface IDEAIContext {
  currentFile: string;
  currentLine: number;
  selectedCode: string;
  projectFiles: string[];
  openFiles: string[];
}

class IDEAIAssistant {
  async generateCode(prompt: string, context: IDEAIContext): Promise<string> {
    // Send to ZacAi with IDE context
  }
  
  async explainCode(code: string): Promise<string> {
    // AI code explanation
  }
  
  async fixError(error: string, code: string): Promise<string> {
    // AI-powered error fix
  }
  
  async inlineSuggestion(prefix: string, suffix: string): Promise<string> {
    // Copilot-style suggestions
  }
}
```

---

## 📋 Phase 5: UI/UX Specifications

### 5.1 Layout Dimensions

**Default Layout (1920x1080):**
```
┌─────────────────────────────────────────────────────────┐
│ Top Bar (60px)                                          │
├──────────┬────────────────┬────────────┬───────────────┤
│  Files   │     Editor     │  Preview   │   AI Chat     │
│  (250px) │    (700px)     │  (450px)   │   (400px)     │
│          │                │            │               │
│   Tree   │     Monaco     │   iframe   │    Chat       │
│   View   │     Editor     │   Preview  │  Interface    │
│          │                │            │               │
│          ├────────────────┤            │               │
│          │   Terminal     │            │               │
│          │   (200px)      │            │               │
└──────────┴────────────────┴────────────┴───────────────┘
```

### 5.2 Color Scheme (Dark Mode)

```css
:root[data-theme="dark"] {
  --ide-bg: #1e1e1e;
  --ide-sidebar-bg: #252526;
  --ide-editor-bg: #1e1e1e;
  --ide-terminal-bg: #1e1e1e;
  --ide-border: #3e3e42;
  --ide-text: #d4d4d4;
  --ide-text-secondary: #858585;
  --ide-accent: #007acc;
  --ide-error: #f48771;
  --ide-warning: #cca700;
  --ide-success: #89d185;
}
```

### 5.3 Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| Quick Open | `Cmd/Ctrl+P` | File finder |
| Command Palette | `Cmd/Ctrl+Shift+P` | All commands |
| Toggle Terminal | `Ctrl+`` | Show/hide terminal |
| Toggle AI Chat | `Cmd/Ctrl+I` | Show/hide AI panel |
| Save File | `Cmd/Ctrl+S` | Save current file |
| Close Tab | `Cmd/Ctrl+W` | Close current tab |
| New File | `Cmd/Ctrl+N` | Create new file |
| Format Code | `Shift+Alt+F` | Format document |
| Find | `Cmd/Ctrl+F` | Find in file |
| Replace | `Cmd/Ctrl+H` | Find and replace |
| Go to Line | `Cmd/Ctrl+G` | Jump to line |
| Toggle Comment | `Cmd/Ctrl+/` | Comment/uncomment |

---

## 📋 Phase 6: Integration Points

### 6.1 Existing System Integration

**Chat API Enhancement:**
- Add `ideContext` parameter to chat API
- Include current file, line, selected code
- Return structured code responses

**Admin Pages:**
- `/admin/ide-settings` - IDE configuration
- `/admin/models` - Add "Model Layers" tab
- `/admin/domains` - Link domain settings to IDE

**GitHub App:**
- Use existing GitHub OAuth
- Extend with repository operations
- Add webhook support for sync

### 6.2 New Routes

```
/ide                          # Main IDE interface
/ide/project/[id]             # Specific project
/api/ide/files                # File operations API
/api/ide/execute              # Code execution API
/api/ide/github               # GitHub operations API
/api/ide/ai                   # AI assistance API
```

---

## 📋 Phase 7: Performance & Scalability

### 7.1 Optimization Strategies

1. **Code Splitting:**
   - Lazy load Monaco Editor
   - Dynamic imports for terminal
   - Split WebAssembly module

2. **Caching:**
   - IndexedDB for file content
   - Service Worker for offline support
   - CDN for static assets

3. **WebWorkers:**
   - File system operations
   - Code parsing
   - Syntax highlighting

4. **Virtualization:**
   - Virtual scrolling in file tree
   - Lazy render for large files
   - Pagination for chat history

### 7.2 Resource Limits

- **File Size:** Max 10MB per file
- **Project Size:** Max 100MB total
- **Execution Time:** Max 30s per run
- **Memory:** Max 512MB WebAssembly heap
- **Concurrent Users:** Support 1000+ simultaneous

---

## 📋 Phase 8: Security Considerations

### 8.1 Code Execution Sandbox

- WebAssembly isolation
- No file system access outside sandbox
- Network requests filtered
- Resource limits enforced
- Timeout mechanisms

### 8.2 GitHub Token Management

- Tokens stored in encrypted IndexedDB
- Never exposed to client-side logs
- Token refresh automation
- Scope-limited permissions

### 8.3 XSS Prevention

- Preview iframe sandboxing
- Content Security Policy headers
- Input sanitization
- Output encoding

---

## 📋 Phase 9: Testing Strategy

### 9.1 Unit Tests

```typescript
// File system tests
describe('VirtualFileSystem', () => {
  test('creates and reads files', async () => {
    const fs = new VirtualFileSystem();
    await fs.write('/test.txt', 'Hello');
    expect(await fs.read('/test.txt')).toBe('Hello');
  });
});

// Execution tests
describe('CodeExecutor', () => {
  test('executes JavaScript code', async () => {
    const executor = new CodeExecutor();
    const result = await executor.execute('console.log("test")', 'javascript');
    expect(result.output).toContain('test');
  });
});
```

### 9.2 Integration Tests

- End-to-end file operations
- GitHub sync workflow
- AI code generation flow
- Multi-panel interactions

### 9.3 Performance Tests

- Large file handling
- Multiple simultaneous executions
- Memory leak detection
- Load time optimization

---

## 📋 Phase 10: Deployment & Monitoring

### 10.1 Deployment Steps

1. Build optimization
2. CDN configuration
3. Environment variables
4. Database migrations
5. Monitoring setup

### 10.2 Metrics to Track

- IDE load time
- Code execution time
- File operation latency
- AI response time
- Error rates
- User engagement

---

## 🎯 Success Criteria

### Must-Have (MVP)
✅ Code editor with syntax highlighting  
✅ File tree with basic operations  
✅ Preview panel for HTML/CSS/JS  
✅ Terminal emulation  
✅ AI chat integration  
✅ GitHub repository clone  
✅ Responsive layout  

### Nice-to-Have (V1.1)
- WebAssembly execution
- Advanced Git operations (branch, merge)
- Collaborative editing
- Plugin system
- Custom themes
- Mobile support

### Future Enhancements (V2.0)
- Real-time collaboration
- Video chat integration
- Screen sharing
- Cloud backup
- AI pair programming
- Code review system

---

## 📝 Conclusion

This comprehensive plan provides a complete roadmap for building a production-grade IDE integration into ZacAi-Atomic. The phased approach ensures systematic development with clear deliverables at each stage.

**Total Timeline:** 4-6 weeks  
**Team Size:** 2-3 developers  
**Budget Estimate:** Minimal (all open-source libraries)

**Next Steps:**
1. Review and approve plan
2. Set up development environment
3. Begin Sprint 1 implementation
4. Iterate based on user feedback

---

**Document Owner:** ZacAi Development Team  
**Last Updated:** November 5, 2025  
**Version:** 1.0
