# ZacAi IDE Technical Documentation

**Version:** 1.0  
**Last Updated:** November 5, 2025

## Architecture Overview

The ZacAi IDE is a browser-based development environment built with modern web technologies, providing a VSCode-like experience directly in the browser.

### Technology Stack

- **Framework**: Next.js 15 + React 19
- **Editor**: Monaco Editor (VSCode engine)
- **Storage**: IndexedDB (via custom VFS)
- **State Management**: Zustand + React Context
- **UI Components**: Radix UI + Tailwind CSS
- **Code Highlighting**: Prism.js
- **Panels**: react-resizable-panels

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      IDE Page                            │
│                    (src/app/ide)                         │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼────┐          ┌──────▼──────┐
   │ Layout  │          │ Components  │
   │  Store  │          │   Layer     │
   └────┬────┘          └──────┬──────┘
        │                      │
        │         ┌────────────┴──────────┐
        │         │                       │
   ┌────▼─────────▼─────┐       ┌───────▼────────┐
   │                    │       │                │
   │  IDE Components    │       │   Utilities    │
   │  - IDELayout       │       │   - VFS        │
   │  - MonacoEditor    │       │   - Hooks      │
   │  - FileExplorer    │       │   - Types      │
   │  - Preview         │       │                │
   │  - AIChatPanel     │       └────────────────┘
   └────────────────────┘
```

---

## Component Structure

### Directory Layout

```
src/
├── app/
│   └── ide/
│       ├── page.tsx              # Main IDE page
│       ├── layout.tsx            # IDE-specific layout
│       └── components/
│           ├── IDELayout.tsx     # Layout manager
│           ├── MonacoEditor.tsx  # Code editor
│           ├── FileExplorer.tsx  # File tree
│           ├── Preview.tsx       # Live preview
│           ├── AIChatPanel.tsx   # AI assistant
│           ├── TerminalWrapper.tsx # Terminal placeholder
│           ├── PanelContainer.tsx  # Panel wrapper
│           └── WindowControls.tsx  # Window buttons
├── lib/
│   └── ide/
│       └── virtualFileSystem.ts  # VFS implementation
├── hooks/
│   └── useVirtualFileSystem.ts   # VFS hook
└── stores/
    └── ideLayoutStore.ts         # Layout state
```

---

## Core Components

### 1. IDELayout

**File**: `src/app/ide/components/IDELayout.tsx`

Main layout manager that orchestrates all IDE panels.

#### Features
- Resizable panel system
- Layout presets (default, focus, development, review, fullIde)
- Panel visibility toggles
- Window controls integration
- Toolbar with layout selector

#### Props
```typescript
interface IDELayoutProps {
  fileExplorer?: React.ReactNode;
  editor?: React.ReactNode;
  preview?: React.ReactNode;
  terminal?: React.ReactNode;
  aiChat?: React.ReactNode;
}
```

#### State Management
Uses Zustand store (`ideLayoutStore`) for:
- Panel visibility
- Panel dimensions
- Active preset
- Theme preferences

---

### 2. MonacoEditor

**File**: `src/app/ide/components/MonacoEditor.tsx`

Code editor component wrapping Monaco Editor.

#### Features
- Multi-file tabs
- Language auto-detection
- Custom themes (zacai-dark, zacai-light)
- IntelliSense configuration
- Dirty file tracking
- Keyboard shortcuts
- Auto-save support

#### Props
```typescript
interface MonacoEditorProps {
  files?: EditorFile[];
  activeFileId?: string;
  onFileChange?: (fileId: string, content: string) => void;
  onFileSave?: (fileId: string, content: string) => void;
  onFileClose?: (fileId: string) => void;
  onActiveFileChange?: (fileId: string) => void;
  className?: string;
}
```

#### Configuration
```typescript
{
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  minimap: { enabled: true },
  lineNumbers: 'on',
  wordWrap: 'off',
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  formatOnPaste: true,
  formatOnType: true,
  quickSuggestions: true,
  bracketPairColorization: { enabled: true },
}
```

---

### 3. FileExplorer

**File**: `src/app/ide/components/FileExplorer.tsx`

Tree view for file navigation.

#### Features
- Recursive tree structure
- Expand/collapse folders
- File/folder icons
- Click handlers
- Create file/folder buttons

#### Data Structure
```typescript
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}
```

---

### 4. AIChatPanel

**File**: `src/app/ide/components/AIChatPanel.tsx`

AI coding assistant integration.

#### Features
- Message history
- Code block extraction
- Syntax highlighting (Prism.js)
- Code actions (copy, insert, preview)
- Quick actions
- Context-aware prompts
- Loading states

#### API Integration
```typescript
POST /api/chat
{
  action: 'message',
  message: prompt // includes file context
}
```

---

### 5. Preview

**File**: `src/app/ide/components/Preview.tsx`

Live preview for HTML/CSS/JavaScript.

#### Features
- Sandboxed iframe execution
- Viewport size toggles
- Console log capture
- Error handling
- Refresh functionality

#### Viewport Sizes
```typescript
{
  mobile: { width: '375px', height: '667px' },
  tablet: { width: '768px', height: '1024px' },
  desktop: { width: '1440px', height: '900px' },
  full: { width: '100%', height: '100%' }
}
```

---

## Virtual File System

### Implementation

**File**: `src/lib/ide/virtualFileSystem.ts`

IndexedDB-based file system with POSIX-like API.

#### Class: VirtualFileSystem

```typescript
class VirtualFileSystem {
  // Initialize database
  async initialize(): Promise<void>
  
  // File operations
  async read(path: string): Promise<string>
  async write(path: string, content: string): Promise<void>
  async delete(path: string): Promise<void>
  async rename(oldPath: string, newPath: string): Promise<void>
  async move(sourcePath: string, destPath: string): Promise<void>
  async exists(path: string): Promise<boolean>
  
  // Directory operations
  async mkdir(path: string): Promise<void>
  async list(path: string): Promise<VirtualFile[]>
  
  // Utility operations
  async search(query: string): Promise<VirtualFile[]>
  async clear(): Promise<void>
}
```

#### Data Model

```typescript
interface VirtualFile {
  id: string;                    // Unique identifier
  name: string;                  // File/folder name
  path: string;                  // Full path
  type: 'file' | 'directory';    // Node type
  content?: string;              // File content (files only)
  children?: string[];           // Child IDs (directories only)
  parent?: string;               // Parent ID
  metadata: FileMetadata;        // Timestamps and size
}

interface FileMetadata {
  created: Date;
  modified: Date;
  size: number;
}
```

#### Storage Schema

```
Database: ZacAi-IDE-FileSystem
Store: files
  Key: id (string)
  Indexes:
    - path (unique)
    - parent
    - type
```

### Hook: useVirtualFileSystem

**File**: `src/hooks/useVirtualFileSystem.ts`

React hook providing VFS operations.

#### Methods

```typescript
{
  isReady: boolean;
  error: string | null;
  
  // File operations
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  deleteFile(path: string): Promise<void>
  renameFile(oldPath: string, newPath: string): Promise<void>
  moveFile(sourcePath: string, destPath: string): Promise<void>
  fileExists(path: string): Promise<boolean>
  
  // Directory operations
  createDirectory(path: string): Promise<void>
  listDirectory(path: string): Promise<VirtualFile[]>
  
  // Utility operations
  searchFiles(query: string): Promise<VirtualFile[]>
  getFileTree(rootPath: string): Promise<FileNode[]>
  initializeSampleProject(): Promise<void>
}
```

---

## State Management

### Layout Store

**File**: `src/stores/ideLayoutStore.ts`

Zustand store with persistence for layout state.

#### State Structure

```typescript
interface IDELayoutState {
  panels: Record<PanelId, PanelState>;
  activePreset: LayoutPreset;
  theme: 'light' | 'dark' | 'auto';
  
  // Actions
  togglePanel: (panelId: PanelId) => void;
  minimizePanel: (panelId: PanelId) => void;
  maximizePanel: (panelId: PanelId) => void;
  restorePanel: (panelId: PanelId) => void;
  setPanelSize: (panelId: PanelId, width?: number, height?: number) => void;
  applyPreset: (preset: LayoutPreset) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  resetLayout: () => void;
}
```

#### Panel State

```typescript
interface PanelState {
  id: PanelId;
  visible: boolean;
  width?: number;
  height?: number;
  minimized: boolean;
  maximized: boolean;
  order: number;
}
```

#### Persistence

Stored in `localStorage` as `ide-layout-storage`.

---

## Styling & Theming

### CSS Variables

**File**: `src/styles/globals.css`

IDE-specific color variables:

```css
:root {
  /* Light mode */
  --ide-bg: 0 0% 100%;
  --ide-sidebar-bg: 0 0% 96.1%;
  --ide-editor-bg: 0 0% 100%;
  --ide-terminal-bg: 0 0% 100%;
  --ide-border: 0 0% 89.8%;
  --ide-text: 0 0% 3.9%;
  --ide-text-secondary: 0 0% 45.1%;
  --ide-accent: 221.2 83.2% 53.3%;
  --ide-error: 0 84.2% 60.2%;
  --ide-warning: 43 74% 66%;
  --ide-success: 142 71% 45%;
}

.dark {
  /* Dark mode */
  --ide-bg: 0 0% 11.8%;
  --ide-sidebar-bg: 0 0% 14.6%;
  --ide-editor-bg: 0 0% 11.8%;
  --ide-terminal-bg: 0 0% 11.8%;
  --ide-border: 0 0% 24.3%;
  --ide-text: 0 0% 83.1%;
  --ide-text-secondary: 0 0% 52.5%;
  --ide-accent: 221.2 83.2% 53.3%;
  --ide-error: 0 62.8% 50.6%;
  --ide-warning: 43 96.4% 56.3%;
  --ide-success: 142 76% 36%;
}
```

---

## Performance Optimization

### Implemented

1. **Code Splitting**
   - Dynamic imports for heavy components
   - Lazy loading Monaco Editor

2. **Memoization**
   - React.memo for expensive components
   - useCallback for event handlers
   - useMemo for computed values

3. **Virtual Scrolling**
   - File tree uses virtualization for large directories

4. **Debouncing**
   - File save operations debounced
   - AI chat input debounced

### Future Optimizations

1. **WebWorkers**
   - File system operations
   - Code parsing
   - Syntax highlighting

2. **Caching**
   - Monaco models cached
   - File content cached in memory

3. **Bundling**
   - Tree shaking for smaller bundles
   - Code splitting for routes

---

## Security

### Implemented

1. **Sandbox Execution**
   - Preview iframe sandboxed
   - No eval() usage
   - CSP headers

2. **Input Sanitization**
   - File paths validated
   - Content escaped
   - XSS prevention

3. **Storage Isolation**
   - IndexedDB per origin
   - No cross-origin access

### Future Enhancements

1. **Authentication**
   - User-specific storage
   - Session management

2. **Rate Limiting**
   - API request limits
   - File operation limits

3. **Encryption**
   - File content encryption
   - Secure token storage

---

## API Integration

### Chat API

**Endpoint**: `POST /api/chat`

```typescript
// Request
{
  action: 'initialize' | 'message',
  message?: string
}

// Response (message)
{
  response: string,
  sessionId?: string
}
```

### IDE-Specific Context

```typescript
const context = {
  currentFile: string,       // Current file name
  currentCode: string,       // Current file content
  projectContext: string     // Project description
};

const prompt = `
  Current file: ${context.currentFile}
  
  Current code:
  \`\`\`
  ${context.currentCode}
  \`\`\`
  
  Project context: ${context.projectContext}
  
  User question: ${userMessage}
`;
```

---

## Testing

### Unit Tests

**Location**: `src/ai/__tests__/`

Test files (planned):
- `ide-integration.test.ts`
- `file-system.test.ts`
- `monaco-editor.test.ts`
- `virtual-file-system.test.ts`

### Test Framework

- **Runner**: Vitest
- **UI**: @vitest/ui
- **Testing Library**: @testing-library/react

### Running Tests

```bash
npm test                    # Run all tests
npm run test:ui            # Run with UI
npm run test:coverage      # Generate coverage report
```

---

## Deployment

### Build

```bash
npm run build
```

### Output

```
.next/
├── static/
│   └── chunks/          # Code-split bundles
├── server/
│   └── app/
│       └── ide/         # IDE pages
└── standalone/          # Standalone build
```

### Environment Variables

```env
# Optional
NEXT_PUBLIC_IDE_STORAGE_QUOTA=52428800  # 50MB
NEXT_PUBLIC_IDE_MAX_FILES=1000
NEXT_PUBLIC_IDE_THEME=auto
```

---

## Browser Support

### Recommended

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+

### Limited Support

- ⚠️ Safari 14+ (some features may not work)

### Requirements

- IndexedDB support
- ES2020+ JavaScript
- CSS Grid & Flexbox
- WebAssembly (future)

---

## Troubleshooting

### Common Issues

#### 1. Monaco Editor Not Loading

**Symptom**: Blank editor panel

**Solution**:
- Check browser console for errors
- Ensure Monaco is not blocked by ad blockers
- Clear browser cache
- Try incognito mode

#### 2. Files Not Persisting

**Symptom**: Files disappear on refresh

**Solution**:
- Check browser storage quota
- Verify IndexedDB is enabled
- Check for browser privacy settings
- Clear and reinitialize database

#### 3. Performance Issues

**Symptom**: Slow typing or lag

**Solution**:
- Close unused tabs
- Reduce minimap size
- Disable word wrap
- Clear browser cache

---

## Contributing

### Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open `/ide` in browser

### Code Style

- **Formatter**: Prettier
- **Linter**: ESLint
- **TypeScript**: Strict mode enabled

### Adding Features

1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit PR

---

## Future Roadmap

### Phase 7: GitHub Integration
- Clone repositories
- Push/pull changes
- Branch management
- Commit history

### Phase 8: Advanced Terminal
- Full xterm.js integration
- Command execution
- npm/yarn support
- Process management

### Phase 9: Collaboration
- Real-time editing (CRDT)
- User presence
- Shared cursors
- Chat integration

### Phase 10: Extensions
- Plugin API
- Custom themes
- Language servers
- Extension marketplace

---

## References

- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

**Maintained by**: ZacAi Development Team  
**Last Updated**: November 5, 2025
