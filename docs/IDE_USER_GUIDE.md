# ZacAi IDE User Guide

**Version:** 1.0  
**Last Updated:** November 5, 2025

## Overview

ZacAi IDE is a modern, browser-based integrated development environment built into the ZacAi-Atomic platform. It provides a complete coding environment with AI assistance, file management, and live preview capabilities.

---

## Getting Started

### Accessing the IDE

Navigate to `/ide` in your ZacAi application:
```
http://localhost:3000/ide
```

### First Launch

On first launch, the IDE automatically creates a sample React TypeScript project with:
- `/src/` - Source code directory
- `/src/components/` - React components
- `/src/utils/` - Utility functions
- `package.json` - Project configuration
- `README.md` - Project documentation

---

## Interface Overview

The IDE consists of 5 main panels:

### 1. File Explorer (Left)
- Tree view of your project files
- Create new files/folders with toolbar buttons
- Click files to open them in the editor
- Expand/collapse folders

### 2. Code Editor (Center-Left)
- Monaco Editor (VSCode engine)
- Multi-file tabs
- Syntax highlighting for 20+ languages
- IntelliSense and auto-completion
- Line numbers and minimap
- Find & replace
- Bracket matching

### 3. Preview (Center-Right)
- Live preview for HTML/CSS/JavaScript
- Responsive viewport toggles:
  - 📱 Mobile (375px)
  - 📱 Tablet (768px)
  - 🖥️ Desktop (1440px)
  - 👁️ Full width
- Refresh button
- Sandboxed iframe execution

### 4. Terminal (Bottom of Editor)
- Command-line interface placeholder
- Future: Full terminal emulation

### 5. AI Chat (Right)
- AI coding assistant
- Code generation and explanation
- Quick actions:
  - 💡 Explain this code
  - 🔧 Fix errors
  - ⚡ Optimize
  - 🧪 Add tests
- Code block actions:
  - 📋 Copy to clipboard
  - 📄 Insert into editor
  - 👁️ Preview

---

## Features

### Code Editing

#### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Save file | `Ctrl + S` | `Cmd + S` |
| Close tab | `Ctrl + W` | `Cmd + W` |
| Find | `Ctrl + F` | `Cmd + F` |
| Replace | `Ctrl + H` | `Cmd + H` |
| Go to line | `Ctrl + G` | `Cmd + G` |
| Comment | `Ctrl + /` | `Cmd + /` |
| Format | `Shift + Alt + F` | `Shift + Option + F` |

#### Supported Languages

- TypeScript/JavaScript (TSX/JSX)
- Python
- Java
- Go
- Rust
- HTML/CSS
- JSON
- Markdown
- And more...

#### Features

- **IntelliSense**: Auto-completion as you type
- **Bracket Matching**: Auto-close brackets and quotes
- **Format on Save**: Automatic code formatting
- **Dirty File Indicator**: Yellow dot on unsaved tabs
- **Multi-cursor**: Hold `Alt` and click

### File Management

#### Creating Files

1. Click the "+" (New File) button in File Explorer toolbar
2. Enter file name with extension
3. File appears in the tree and opens in editor

#### Creating Folders

1. Click the folder "+" button in toolbar
2. Enter folder name
3. Folder appears in the tree

#### Saving Files

- **Auto-save**: Changes are tracked (yellow dot on tab)
- **Manual save**: Click "Save" button or use `Ctrl/Cmd + S`
- Files are persisted to IndexedDB (survives browser refresh)

#### Deleting Files

*Coming soon*

### AI Assistance

#### Using the AI Chat

1. Type your question in the input box
2. Press `Enter` to send (or click Send button)
3. AI responds with explanations and code
4. Use `Shift + Enter` for new lines

#### Context-Aware Prompts

The AI automatically includes:
- Current file name
- Current file content
- Project context

#### Code Actions

When AI returns code blocks:
- **Copy**: Copy code to clipboard
- **Insert**: Create new file with code
- **Preview**: View HTML/JS/CSS in preview panel

#### Quick Actions

When you have code selected:
1. Click quick action buttons above chat
2. AI receives your code with the prompt
3. Get instant help with:
   - Code explanation
   - Error fixing
   - Optimization suggestions
   - Test generation

### Live Preview

#### Previewing Code

1. Open an HTML, CSS, or JavaScript file
2. Preview panel shows live output
3. Use viewport toggles to test responsiveness
4. Click refresh to reload

#### Supported Content

- HTML with inline styles
- CSS stylesheets
- JavaScript (runs in sandbox)
- Console logs captured (coming soon)

---

## Layout Management

### Panel Controls

Each panel has window controls:
- **Minimize** (`-`): Collapse to title bar
- **Maximize** (`□`): Full screen
- **Close** (`×`): Hide panel

### Layout Presets

Click the "Layout" dropdown in the toolbar:

1. **Default**: All panels visible
2. **Focus**: Editor only (distraction-free)
3. **Development**: Files + Editor + Terminal
4. **Review**: Editor + Preview + AI Chat
5. **Full IDE**: All features visible

### Resizing Panels

- Drag panel dividers to resize
- Layout is saved automatically
- Persists across sessions

---

## Themes

### Switching Themes

The IDE automatically follows your system theme:
- **Light Mode**: Bright, clean interface
- **Dark Mode**: Dark, eye-friendly colors

### Custom Themes

Editor themes:
- `zacai-dark` - Professional dark theme
- `zacai-light` - Clean light theme

---

## File System

### Storage

Files are stored in browser IndexedDB:
- Persists across browser sessions
- Survives page refresh
- Limited by browser storage quota (~50MB typical)

### Operations

- **Read**: Load files from storage
- **Write**: Save changes to storage
- **Create**: Add new files/folders
- **Delete**: Remove files/folders (coming soon)
- **Rename**: Change file names (coming soon)
- **Move**: Organize files (coming soon)

### Backup

**⚠️ Important**: Browser storage can be cleared
- Export important files regularly
- Use Git integration (coming soon)
- Browser settings can clear storage

---

## Tips & Tricks

### Productivity

1. **Use keyboard shortcuts** for common actions
2. **Quick actions** for instant AI help
3. **Layout presets** to optimize screen space
4. **Multi-tab editing** for working on multiple files

### Performance

1. **Close unused tabs** to free memory
2. **Minimize panels** you're not using
3. **Clear browser cache** if IDE slows down

### Best Practices

1. **Save frequently** (`Ctrl/Cmd + S`)
2. **Use descriptive file names**
3. **Organize with folders**
4. **Leverage AI assistant** for learning

---

## Troubleshooting

### IDE Not Loading

1. Clear browser cache
2. Check browser console for errors
3. Ensure JavaScript is enabled
4. Try a different browser

### Files Not Saving

1. Check browser storage quota
2. Try saving to a different location
3. Clear old files to free space
4. Check browser console for errors

### Preview Not Working

1. Check for JavaScript errors in code
2. Ensure HTML is valid
3. Try refreshing the preview
4. Check browser console

### AI Chat Not Responding

1. Check network connection
2. Ensure API is accessible
3. Try refreshing the page
4. Check browser console for errors

---

## Keyboard Reference

### Global

| Action | Shortcut |
|--------|----------|
| Toggle Terminal | `` Ctrl + ` `` |
| Toggle AI Chat | `Ctrl/Cmd + I` |
| Command Palette | `Ctrl/Cmd + Shift + P` |
| Quick Open | `Ctrl/Cmd + P` |

### Editor

| Action | Shortcut |
|--------|----------|
| Save | `Ctrl/Cmd + S` |
| Close Tab | `Ctrl/Cmd + W` |
| New File | `Ctrl/Cmd + N` |
| Find | `Ctrl/Cmd + F` |
| Replace | `Ctrl/Cmd + H` |
| Go to Line | `Ctrl/Cmd + G` |
| Comment/Uncomment | `Ctrl/Cmd + /` |
| Format Document | `Shift + Alt/Option + F` |
| Multi-cursor | `Alt/Option + Click` |

---

## Limitations

### Current Limitations

1. **No Git integration** (coming soon)
2. **Limited terminal** (placeholder)
3. **No file search** across project
4. **No folder operations** (delete, move)
5. **No collaboration** features
6. **Storage quota** limited by browser

### Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ⚠️ Safari (some features limited)
- ❌ IE (not supported)

---

## Future Features

### Planned Enhancements

1. **GitHub Integration**
   - Clone repositories
   - Push/pull changes
   - Branch management

2. **Full Terminal**
   - Command execution
   - npm/yarn support
   - File system commands

3. **Advanced File Operations**
   - Search across files
   - Bulk rename
   - Drag & drop

4. **Collaboration**
   - Real-time editing
   - User presence
   - Chat integration

5. **Extensions**
   - Plugin system
   - Custom themes
   - Language servers

---

## Support

For issues, questions, or feature requests:
- GitHub Issues: [Repository Issues](https://github.com/AiAscended/ZacAi-Atomic/issues)
- Documentation: `/docs/` folder
- Community: TBD

---

## Changelog

### Version 1.0.0 (November 5, 2025)

**Initial Release**
- ✨ Monaco code editor integration
- ✨ Virtual file system (IndexedDB)
- ✨ AI coding assistant
- ✨ Live preview panel
- ✨ Resizable layout system
- ✨ File explorer with tree view
- ✨ Multi-file tabs
- ✨ Keyboard shortcuts
- ✨ Theme support
- ✨ Sample project generator

---

**Happy Coding! 🚀**
