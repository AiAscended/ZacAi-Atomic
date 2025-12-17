# ZacAi Internal Developer Console

## Overview

The ZacAi Internal Developer Console is an admin-only feature that provides direct access to ZacAi's codebase through a web-based interface. This console is designed for system administrators and developers to inspect, edit, and manage ZacAi's own code in real-time.

## Features

### 1. File Tree Browser
- **Hierarchical directory structure** showing the entire ZacAi project
- **Lazy loading** for efficient performance with large codebases
- **File type icons** for quick visual identification
- **Expand/collapse** directories for easy navigation

### 2. Code Editor
- **Monaco Editor** integration (same engine as VS Code)
- **Multi-tab support** for working with multiple files simultaneously
- **Syntax highlighting** for TypeScript, JavaScript, JSON, YAML, Python, Rust, and more
- **Dirty state tracking** with visual indicators for unsaved changes
- **Auto-save support** with Ctrl/Cmd+S keyboard shortcut
- **Real-time file modification timestamps**

### 3. Integrated Terminal
- **Full bash shell access** via xterm.js
- **WebSocket-based** real-time communication
- **Terminal session management** with automatic cleanup
- **Connection status indicators**
- **Multiple terminal sessions** support (future enhancement)
- **Command history and scrollback** buffer

## Architecture

### Backend Components

#### API Routes
- `GET /api/admin/dev-console/files?path=...` - List directory contents
- `GET /api/admin/dev-console/file?path=...` - Read file contents
- `POST /api/admin/dev-console/file` - Write file contents
- `DELETE /api/admin/dev-console/file?path=...` - Delete files/directories

#### WebSocket Handler
- `/api/admin/dev-console/terminal` - Terminal WebSocket endpoint
- Spawns bash shells using `node-pty` for proper terminal emulation
- Manages multiple concurrent terminal sessions
- Automatic cleanup on disconnect

#### Terminal Manager (`src/lib/terminalManager.ts`)
- Singleton service managing all terminal sessions
- Session tracking with unique IDs
- Graceful shutdown and cleanup
- Audit logging for all terminal activities

### Frontend Components

#### AdminFileTree (`src/components/admin/dev-console/AdminFileTree.tsx`)
- React component for file tree visualization
- State management for expanded/collapsed directories
- Lazy loading of directory contents
- File selection and navigation

#### AdminCodeEditor (`src/components/admin/dev-console/AdminCodeEditor.tsx`)
- Monaco Editor wrapper with custom controls
- Tab management for multiple open files
- Dirty state tracking and save functionality
- Syntax highlighting based on file extension

#### AdminTerminal (`src/components/admin/dev-console/AdminTerminal.tsx`)
- xterm.js integration with custom styling
- WebSocket connection management
- Terminal resize handling
- Status indicators and reconnection logic

#### Dev Console Page (`src/app/admin/dev-console/page.tsx`)
- Main layout orchestrating all three components
- Split-pane interface (file tree, editor, terminal)
- Warning banner for system-level access
- Responsive design

## Security

### Access Control
- **Admin-only access** - Only users with admin privileges can access the console
- **Path validation** - All file operations are restricted to `ZACAI_CODE_ROOT`
- **Audit logging** - All file changes and terminal sessions are logged

### Configuration
```env
# Set the base directory for file operations
ZACAI_CODE_ROOT=/path/to/zacai/project

# For production, ensure this points to a safe directory
# and implements additional security measures
```

### Security Considerations
1. **Never expose this console to public internet without proper authentication**
2. **Use RBAC (Role-Based Access Control)** to restrict access to system developers only
3. **Monitor audit logs** for suspicious activity
4. **Implement rate limiting** on API endpoints
5. **Use HTTPS/WSS** in production for encrypted connections
6. **Consider implementing approval workflows** for critical file changes

## Usage

### Starting the Server
```bash
# Development mode with WebSocket support
npm run dev

# Production mode
npm run build
npm start
```

### Accessing the Console
1. Navigate to `/admin/dev-console` in your browser
2. Authenticate as an admin user
3. The console will load with three panes:
   - Left: File tree
   - Center/Top: Code editor
   - Bottom: Terminal

### Working with Files
1. **Navigate** the file tree by clicking folders to expand/collapse
2. **Open files** by clicking on file names
3. **Edit** files in the Monaco editor
4. **Save** changes using the Save button or Ctrl/Cmd+S
5. **Close tabs** by clicking the X icon on each tab

### Using the Terminal
1. Terminal automatically connects on page load
2. Use standard bash commands
3. Working directory is set to `ZACAI_CODE_ROOT`
4. Reconnect using the refresh button if connection drops
5. Clear terminal output with the trash icon

## Future Enhancements

### Self-Learning Integration
The console is designed with future self-learning capabilities in mind:
- **API-first architecture** allows ZacAi agents to programmatically interact with files
- **Audit trails** provide learning data for self-improvement cycles
- **Structured file operations** enable automated code generation and refactoring
- **Terminal API wrapper** (planned) for agent-triggered script execution

### Planned Features
- [ ] Multiple terminal tabs/sessions
- [ ] File search and replace across project
- [ ] Git integration (status, commit, diff)
- [ ] Code formatting and linting on save
- [ ] Collaborative editing (multiple admins)
- [ ] File upload/download
- [ ] Code snippets and templates
- [ ] Integrated debugging tools
- [ ] Real-time file watchers and auto-reload
- [ ] Approval workflows for critical changes

## Troubleshooting

### Terminal Won't Connect
- Check that the custom server is running (`server.ts`)
- Verify WebSocket endpoint is accessible
- Check browser console for WebSocket errors
- Ensure firewall allows WebSocket connections

### Files Won't Load
- Verify `ZACAI_CODE_ROOT` environment variable is set
- Check file permissions in the project directory
- Review API route logs for errors
- Ensure path validation is working correctly

### Editor Performance Issues
- Close unused tabs to reduce memory usage
- Disable minimap for very large files
- Consider increasing Node.js memory limit
- Check Monaco Editor configuration options

## Development

### Running in Development Mode
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and set ZACAI_CODE_ROOT

# Start development server with WebSocket support
npm run dev
```

### Testing Components Individually
Each component can be tested in isolation:
```tsx
import { AdminFileTree } from '@/components/admin/dev-console/AdminFileTree';
import { AdminCodeEditor } from '@/components/admin/dev-console/AdminCodeEditor';
import { AdminTerminal } from '@/components/admin/dev-console/AdminTerminal';
```

### Adding New File Operations
1. Add route handler in `/api/admin/dev-console/`
2. Implement path validation and security checks
3. Add audit logging
4. Update frontend components to use new API

## Contributing

When contributing to the Dev Console:
1. Follow existing code patterns and architecture
2. Add comprehensive error handling
3. Include audit logging for all operations
4. Test with various file types and sizes
5. Document any new environment variables
6. Update this README with new features

## License

Part of the ZacAi Atomic project. See main project LICENSE for details.
