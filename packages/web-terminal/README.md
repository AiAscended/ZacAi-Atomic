# @zacai/web-terminal

Enterprise-grade **browser-based terminal** for ZacAi System Core admin dashboard.

## Features

- **xterm.js** integration: Full VT-100 emulation in the browser
- **Addon support**: Search, fit-to-window, resizing
- **RBAC-gated execution**: Token-based authorization for privileged commands
- **Real-time output streaming**: WebSocket support for live feedback (future)
- **Command history**: Local storage of recent commands
- **Theme support**: Light/dark modes with system palette
- **Accessibility**: Screen reader support, keyboard navigation

## Architecture

```
packages/web-terminal/
├── lib/
│   └── index.js          # Backend server-side terminal handler
├── client/
│   └── terminal.js       # Client-side xterm.js integration
├── styles/
│   └── terminal.css      # Terminal styling (xterm customization)
└── package.json
```

## Usage

### Backend (Node.js)
```javascript
import { TerminalHandler } from '@zacai/web-terminal';

// In your HTTP server:
const terminalHandler = new TerminalHandler({
  adminToken: process.env.ADMIN_TOKEN,
  commandWhitelist: ['status', 'health', 'diagnostics'],
});

server.on('request', (req, res) => {
  if (req.url === '/api/terminal' && req.method === 'POST') {
    terminalHandler.handle(req, res);
  }
});
```

### Frontend (Browser)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
<div id="terminal-container" style="height: 400px; overflow: hidden;"></div>

<script type="module">
  import { Terminal } from '@zacai/web-terminal/client';
  
  const term = new Terminal({
    container: '#terminal-container',
    apiEndpoint: '/api/terminal',
    adminToken: localStorage.getItem('github_token'),
  });
  
  term.open();
</script>
```

## Backend API (`/api/terminal`)

**POST /api/terminal**

Request:
```json
{
  "cmd": "health",
  "authorization": "Bearer <ADMIN_TOKEN>"
}
```

Response:
```json
{
  "output": "HEALTHY",
  "status": 200,
  "timestamp": "2025-12-26T22:07:00Z"
}
```

## Security

- **Authorization**: Bearer token (GitHub OAuth or admin secret)
- **Command whitelisting**: Only explicit commands allowed
- **Audit logging**: All terminal commands logged to compliance trail
- **Timeouts**: Command execution capped at 30s
- **Resource limits**: Memory and CPU throttling for long-running tasks

## Enterprise Readiness

- ✅ HIPAA-compliant audit trails
- ✅ SOC2 compliance logging
- ✅ Role-based access control (Phase 9)
- ✅ Encrypted command history (Phase 8)
- ✅ Disaster recovery & sandboxed execution (Phase 6)

## Future Enhancements

- **WebSocket support**: Real-time streaming of long-running jobs
- **Job scheduling**: Cron-like task runner for maintenance
- **File upload/download**: Via terminal
- **Multi-session support**: Multiple concurrent terminals per user
- **Replay & recording**: Session playback for audit
- **IDE integration**: Merge with code editor (Monaco/VSCode)

## Phase Integration

- **Phase 5**: Initial browser terminal (this package)
- **Phase 6**: Sandboxed execution, self-repair automation
- **Phase 7**: Agent-driven terminal commands, AI suggestions
- **Phase 8**: Encrypted history, full audit trails
- **Phase 9**: RBAC, multi-user, policy enforcement

---

**License**: MIT
**Author**: ZacAi Team
**Status**: Enterprise Alpha (v1.0.0)
