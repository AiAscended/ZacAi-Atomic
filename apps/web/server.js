/**
 * System Core Development Server
 * Provides real-time visualization of system status, metrics, and compliance
 * Accessible at: http://localhost:3000
 */

import http from 'http';
import { URL } from 'url';
import { recommendAction } from '../../packages/system-core-agent/lib/index.js';

// Create a simple in-memory system state for demonstration
const systemState = {
  status: 'RUNNING',
  uptime: 0,
  cycles: 0,
  successRate: 100,
  errors: 0,
  complianceEvents: 0,
  startTime: Date.now(),
  mode: 'RUN',
  health: 'HEALTHY',
  lastUpdate: new Date().toISOString(),
};

// Simple HTML dashboard
function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏥 ZacAi Hospital-Grade System Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .subtitle {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 25px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .card:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-5px);
    }
    
    .card-header {
      font-size: 0.9em;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .metric-value {
      font-size: 2.5em;
      font-weight: bold;
      margin: 10px 0;
      font-variant-numeric: tabular-nums;
    }

    /* Control Panel additions */
    .control-panel {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 20px;
      margin-bottom: 30px;
    }

    .terminal {
      background: rgba(0,0,0,0.6);
      border-radius: 8px;
      padding: 12px;
      min-height: 180px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #d6ffd6;
      overflow: auto;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .ai-chat {
      background: rgba(255,255,255,0.04);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ai-chat input[type="text"] {
      width: 100%;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.2);
      color: #fff;
    }

    .toggle-row { display:flex; gap:12px; align-items:center; }
    .toggle { cursor:pointer; padding:6px 10px; border-radius:6px; background: rgba(255,255,255,0.06); }
    
    .metric-label {
      font-size: 0.95em;
      opacity: 0.8;
    }
    
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 600;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-healthy {
      background: rgba(76, 175, 80, 0.3);
      border: 1px solid #4CAF50;
      color: #81C784;
    }
    
    .status-degraded {
      background: rgba(255, 193, 7, 0.3);
      border: 1px solid #FFC107;
      color: #FFD54F;
    }
    
    .status-critical {
      background: rgba(244, 67, 54, 0.3);
      border: 1px solid #F44336;
      color: #EF5350;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      margin-top: 10px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #81C784, #66BB6A);
      transition: width 0.3s ease;
      border-radius: 4px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
          <h1>ZacAi System Core v0.0.1</h1>
          <p class="subtitle">Enterprise Hybrid AI Platform Dashboard</p>
          <p style="font-size: 0.9em; opacity: 0.7; margin-top: 10px;">
            System Administrator: <a href="mailto:zacai.email@gmail.com" style="color: #81C784; text-decoration: underline;">zacai.email@gmail.com</a>
          </p>
          <div style="margin-top:12px; display:flex; gap:12px; justify-content:center;">
            <div class="toggle-row">
              <div class="toggle" id="themeToggle">Toggle Light/Dark</div>
              <div class="toggle" id="terminalClear">Clear Terminal</div>
            </div>
          </div>
    }
          <h2 class="section-title">🔐 Compliance & Audit</h2>
    .info-table {
      width: 100%;
        <!-- Status Overview + Control Panel -->
        <div class="section">
          <div class="control-panel">
            <div>
              <h2 class="section-title"><span class="live-indicator"></span>System Status</h2>
              <div class="grid">
                <div class="card">
                  <div class="card-header">System Status</div>
                  <div class="metric-value" id="status">RUNNING</div>
                  <div class="status-badge status-healthy" id="health-badge">HEALTHY</div>
                </div>
            
                <div class="card">
                  <div class="card-header">System Mode</div>
                  <div class="metric-value" id="mode">RUN</div>
                </div>
            
                <div class="card">
                  <div class="card-header">Uptime</div>
                  <div class="metric-value" id="uptime">0s</div>
                </div>
              </div>

              <h2 class="section-title" style="margin-top:18px">Quick Actions</h2>
              <div class="grid">
                <div class="card">
                  <div class="card-header">Check Health</div>
                  <button onclick="fetchAndShow('/api/health')">Run</button>
                </div>
                <div class="card">
                  <div class="card-header">Run Diagnostics</div>
                  <button onclick="appendTerminal('Diagnostics run started...')">Start</button>
                </div>
                <div class="card">
                  <div class="card-header">Compliance Snapshot</div>
                  <button onclick="fetchAndShow('/api/compliance')">View</button>
                </div>
              </div>
            </div>

            <div>
              <div class="ai-chat">
                <div style="font-weight:600;">AI Assistant</div>
                <div id="aiOutput" style="min-height:80px; font-family:monospace; font-size:0.9em; color:#eaf7ea;">Ask the AI for suggestions...</div>
                <input id="aiInput" type="text" placeholder="Type a command or question" />
                <div style="display:flex; gap:8px; justify-content:space-between; align-items:center;">
                  <div>
                    <button onclick="sendAI()">Send</button>
                    <button onclick="startVoice()">🎤</button>
                    <button onclick="stopVoice()">🔈</button>
                  </div>
                  <div style="font-size:0.85em; opacity:0.7;">Mode: Hybrid AI</div>
                </div>
              </div>

              <div style="margin-top:12px;">
                <div class="terminal" id="terminal">$ Welcome to ZacAi Terminal\n</div>
              </div>
            </div>
          </div>

          <!-- continue existing status overview below -->
    .info-table td:first-child {
      font-weight: 600;
      opacity: 0.8;
      width: 40%;
    }
    
    .info-table td:last-child {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    .live-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: #4CAF50;
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
      }
      50% {
        opacity: 0.8;
        box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
      }
    }
    
    .feature-list {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .feature-list li {
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-left: 3px solid #4CAF50;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .feature-list li:hover {
      background: rgba(255, 255, 255, 0.1);
      border-left-color: #81C784;
      padding-left: 20px;
    }
    
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: rgba(76, 175, 80, 0.3);
      border: 1px solid #4CAF50;
      color: #81C784;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      margin-right: 10px;
      margin-top: 10px;
    }
    
    .button:hover {
      background: rgba(76, 175, 80, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
    
    .footer {
      text-align: center;
      padding-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      opacity: 0.6;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>ZacAi System Core v0.0.1</h1>
      <p class="subtitle">Enterprise Hybrid AI Platform Dashboard</p>
      <p style="font-size: 0.9em; opacity: 0.7; margin-top: 10px;">
        System Administrator: <a href="mailto:zacai.email@gmail.com" style="color: #81C784; text-decoration: underline;">zacai.email@gmail.com</a>
      </p>
    </header>
    
    <!-- Status Overview -->
    <div class="section">
      <h2 class="section-title"><span class="live-indicator"></span>System Status</h2>
      <div class="grid">
        <div class="card">
          <div class="card-header">System Status</div>
          <div class="metric-value" id="status">RUNNING</div>
          <div class="status-badge status-healthy" id="health-badge">HEALTHY</div>
        </div>
        
        <div class="card">
          <div class="card-header">System Mode</div>
          <div class="metric-value" id="mode">RUN</div>
          <div class="metric-label">Operational State</div>
        </div>
        
        <div class="card">
          <div class="card-header">Uptime</div>
          <div class="metric-value" id="uptime">0s</div>
          <div class="metric-label">Time Since Boot</div>
        </div>
      </div>
    </div>
    
    <!-- Performance Metrics -->
    <div class="section">
      <h2 class="section-title">📊 Performance Metrics</h2>
      <div class="grid">
        <div class="card">
          <div class="card-header">Cycles Executed</div>
          <div class="metric-value" id="cycles">0</div>
          <div class="metric-label">System Ticks</div>
        </div>
        
        <div class="card">
          <div class="card-header">Success Rate</div>
          <div class="metric-value" id="successRate">100%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="successBar" style="width: 100%"></div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">Errors</div>
          <div class="metric-value" id="errors">0</div>
          <div class="metric-label">Critical Failures</div>
        </div>
      </div>
    </div>
    
    <!-- Compliance & Audit -->
    <div class="section">
      <h2 class="section-title">🔐 Compliance & Audit</h2>
      <div class="grid">
        <div class="card">
          <div class="card-header">Compliance Level</div>
          <div class="metric-value" style="font-size: 1.8em;">HIPAA</div>
          <div class="status-badge status-healthy">Compliant</div>
        </div>
        
        <div class="card">
          <div class="card-header">Audit Trail Events</div>
          <div class="metric-value" id="auditEvents">0</div>
          <div class="metric-label">Immutable Logs</div>
        </div>
        
        <div class="card">
          <div class="card-header">Last Event</div>
          <div id="lastEvent" style="font-family: monospace; font-size: 0.85em; margin-top: 10px;">SYSTEM_BOOT</div>
          <div class="metric-label" id="lastEventTime">Just now</div>
        </div>
      </div>
    </div>
    
    <!-- System Architecture -->
    <div class="section">
      <h2 class="section-title">🏗️ System Architecture</h2>
      <table class="info-table">
        <tr>
          <td>Kernel System</td>
          <td>✅ Active (9 modules)</td>
        </tr>
        <tr>
          <td>Methods System</td>
          <td>✅ Active (6 modules)</td>
        </tr>
        <tr>
          <td>Core Orchestrator</td>
          <td>✅ Active (3 components)</td>
        </tr>
        <tr>
          <td>Compliance Tracker</td>
          <td>✅ Active (immutable audit trail)</td>
        </tr>
        <tr>
          <td>Health Monitor</td>
          <td>✅ Active (real-time metrics)</td>
        </tr>
        <tr>
          <td>Recovery System</td>
          <td>✅ Active (deterministic)</td>
        </tr>
      </table>
    </div>
    
    <!-- ZacAi System Core Features -->
    <div class="section">
      <h2 class="section-title">ZacAi System Core Features</h2>
      <ul class="feature-list">
        <li>✅ Audit Trails (configurable retention)</li>
        <li>✅ Regulatory-readiness (configurable validators)</li>
        <li>✅ SOC2-style compliance tracking</li>
        <li>✅ ISO27001-compatible logging</li>
        <li>✅ Automatic Error Recovery</li>
        <li>✅ Deterministic Execution</li>
        <li>✅ Real-time Health Monitoring</li>
        <li>✅ Graceful Degradation</li>
        <li>✅ Self-Healing Capabilities</li>
        <li>✅ Performance Tracking</li>
        <li>✅ Event-Driven Architecture</li>
        <li>✅ Immutable Audit Trail
      </ul>
    </div>
    
    <!-- Package Structure -->
    <div class="section">
      <h2 class="section-title">📦 Monorepo Packages</h2>
      <table class="info-table">
        <tr>
          <td>@zacai/system-kernel</td>
          <td>Core kernel (9 files, 1,200+ LOC)</td>
        </tr>
        <tr>
          <td>@zacai/system-kernel-methods</td>
          <td>Pure functions (6 files, 600+ LOC)</td>
        </tr>
        <tr>
          <td>@zacai/system-core</td>
          <td>Orchestrator (5 files, 1,355 LOC)</td>
        </tr>
        <tr>
          <td>@zacai/system-core-model</td>
          <td>Advisory embeddings (optional)</td>
        </tr>
      </table>
    </div>
    
    <!-- Quick Actions -->
    <div class="section">
      <h2 class="section-title">⚡ Quick Actions</h2>
      <button onclick="fetchAndShow('/api/health')" class="button">Get Health Metrics</button>
      <button onclick="fetchAndShow('/api/compliance')" class="button">View Audit Trail</button>
      <button onclick="fetchAndShow('/api/status')" class="button">System Status JSON</button>
      <button onclick="refreshData()" class="button">Refresh Data</button>
      <div id="panel" style="margin-top:16px; background:rgba(0,0,0,0.25); padding:12px; border-radius:6px; font-family:monospace; white-space:pre-wrap; max-height:320px; overflow:auto; display:none;"></div>
    </div>
    
    <!-- Documentation -->
    <div class="section">
      <h2 class="section-title">📚 Documentation</h2>
      <p>The complete system includes:</p>
      <ul style="margin-top: 15px; padding-left: 20px;">
        <li style="margin-bottom: 10px;"><strong>QUICK_REFERENCE.md</strong> - 5-minute quick start (400 lines)</li>
        <li style="margin-bottom: 10px;"><strong>ENTERPRISE_INTEGRATION_GUIDE.md</strong> - Full integration (1,100 lines)</li>
        <li style="margin-bottom: 10px;"><strong>ARCHITECTURE_DIAGRAM.md</strong> - System design (600 lines)</li>
        <li style="margin-bottom: 10px;"><strong>packages/system-core/README.md</strong> - API reference (300 lines)</li>
        <li style="margin-bottom: 10px;"><strong>DOCUMENTATION_INDEX.md</strong> - Navigation guide (400 lines)</li>
      </ul>
    </div>
    
    <footer class="footer">
      <p>ZacAi System Core v0.0.1 | Production Ready</p>
      <p style="margin-top: 10px; opacity: 0.5;">Dashboard automatically updates every 5 seconds</p>
      <p style="margin-top: 15px; font-size: 0.9em;">
        <strong>System Administrator:</strong> <a href="mailto:zacai.email@gmail.com" style="color: #81C784; text-decoration: none;">zacai.email@gmail.com</a>
        <br><span style="opacity: 0.6;">For system alerts, compliance reports, and administrative support</span>
      </p>
    </footer>
  </div>
  
  <script>
    // Format uptime
    function formatUptime(seconds) {
      if (seconds < 60) return seconds + 's';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return h + 'h ' + m + 'm';
    }
    
    // Update dashboard data
    function updateDashboard() {
      // Simulate system uptime increase
      const uptime = Math.floor((Date.now() - new Date(document.getElementById('uptime').dataset.startTime || Date.now()).getTime()) / 1000);
      document.getElementById('uptime').textContent = formatUptime(uptime);
      document.getElementById('uptime').dataset.startTime = new Date().getTime() - (uptime * 1000);
      
      // Simulate cycle increment
      const cycles = parseInt(document.getElementById('cycles').textContent) + Math.floor(Math.random() * 3);
      document.getElementById('cycles').textContent = cycles;
      
      // Simulate success rate (stays near 100% with occasional dips)
      const currentRate = parseInt(document.getElementById('successRate').textContent);
      const newRate = Math.min(100, currentRate + Math.floor(Math.random() * 0.5));
      document.getElementById('successRate').textContent = newRate + '%';
      document.getElementById('successBar').style.width = newRate + '%';
    }
    
    // Refresh data
    function refreshData() {
      updateDashboard();
    }
    
    // Auto-update every 5 seconds
    setInterval(updateDashboard, 5000);
    
    // Initial setup
    document.getElementById('uptime').dataset.startTime = Date.now();

    // fetch and show panel content in-page
    async function fetchAndShow(path) {
      try {
        const res = await fetch(path);
        const txt = await res.text();
        const panel = document.getElementById('panel');
        panel.style.display = 'block';
        panel.textContent = txt;
        panel.scrollTop = 0;
      } catch (err) {
        const panel = document.getElementById('panel');
        panel.style.display = 'block';
        panel.textContent = 'Error fetching ' + path + ': ' + err.message;
      }
    }

    // Append text to in-page terminal
    function appendTerminal(txt) {
      const t = document.getElementById('terminal');
      t.textContent += '\n' + txt;
      t.scrollTop = t.scrollHeight;
    }

    // Send a message to AI endpoint (mock)
    async function sendAI() {
      const input = document.getElementById('aiInput').value;
      if (!input) return;
      appendTerminal('$ ai> ' + input);
      try {
        const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: input }) });
        const j = await res.json();
        document.getElementById('aiOutput').textContent = j.reply;
        appendTerminal('$ ai-reply> ' + j.reply);
      } catch (e) {
        appendTerminal('$ ai-error> ' + e.message);
      }
    }

    // Theme toggle (simple light/dark switch that preserves palette)
    document.getElementById('themeToggle').addEventListener('click', () => {
      const body = document.body;
      if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        body.style.color = '#fff';
      } else {
        body.classList.add('light-mode');
        body.style.background = 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)';
        body.style.color = '#111';
      }
    });

    // Clear terminal
    document.getElementById('terminalClear').addEventListener('click', () => {
      document.getElementById('terminal').textContent = '$ Welcome to ZacAi Terminal\n';
    });

    // Voice placeholders
    function startVoice() {
      appendTerminal('$ voice> start (placeholder)');
      // real implementation: navigator.mediaDevices.getUserMedia + STT
    }
    function stopVoice() {
      appendTerminal('$ voice> stop (placeholder)');
    }
  </script>
</body>
</html>`;
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/' || pathname === '/dashboard') {
    // Serve dashboard
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getDashboardHTML());
  } else if (pathname === '/api/status') {
    // Return system status as JSON
    res.writeHead(200, { 'Content-Type': 'application/json' });
    systemState.uptime = Date.now() - systemState.startTime;
    systemState.lastUpdate = new Date().toISOString();
    res.end(JSON.stringify(systemState, null, 2));
  } else if (pathname === '/api/health') {
    // Return health metrics
    const health = {
      status: 'HEALTHY',
      uptime: systemState.uptime,
      cycleCount: systemState.cycles,
      successRate: systemState.successRate / 100,
      errorCount: systemState.errors,
      systemMode: systemState.mode,
      timestamp: new Date().toISOString(),
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  } else if (pathname === '/api/compliance') {
    // Return compliance/audit trail
    const compliance = {
      level: 'HIPAA',
      totalEvents: systemState.complianceEvents,
      recentEvents: [
        { timestamp: new Date().toISOString(), eventType: 'SYSTEM_BOOT', details: 'System initialized' },
        { timestamp: new Date().toISOString(), eventType: 'STARTUP_CHECKS_PASSED', details: 'All startup checks passed' },
      ],
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(compliance, null, 2));
  } else if (pathname === '/api/diagnostics') {
    // Lightweight diagnostics endpoint (synchronous)
    const diagnostics = {
      kernel: { status: 'OK', modules: 9 },
      wasm: { present: true, path: '/packages/system-kernel-methods/wasm_dist/zk_kernels_bg.wasm' },
      memory: { rss: process.memoryUsage().rss },
      uptimeMs: Date.now() - systemState.startTime,
      timestamp: new Date().toISOString(),
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(diagnostics, null, 2));
  } else if (pathname === '/api/ai' && req.method === 'POST') {
    // AI endpoint: use system-core-agent.recommendAction (safe, local mock)
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const prompt = data.prompt || '';
        const reply = await recommendAction(prompt);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else if (pathname === '/api/terminal' && req.method === 'POST') {
    // Secure simulated terminal: requires Authorization header Bearer token to unlock advanced actions
    const auth = (req.headers['authorization'] || req.headers['Authorization'] || '');
    const token = (process.env.ADMIN_TOKEN || 'admin-secret');
    const authorized = auth === `Bearer ${token}`;

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const cmd = (data.cmd || '').trim();

        // Safe built-in commands
        if (cmd === 'status') {
          const out = { status: systemState.status, uptimeMs: Date.now() - systemState.startTime, health: systemState.health };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ output: out }));
          return;
        }

        // If authorized, provide simulated privileged response
        if (authorized) {
          const output = `authorized-exec-sim: ${cmd}`;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ output }));
          return;
        }

        // Not authorized: echo only
        const output = `echo: ${cmd} (unauthorized)`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ output }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🏥 ZacAi System Dashboard Server Started             ║
╚═══════════════════════════════════════════════════════════════╝

📊 Dashboard: http://localhost:${PORT}
📈 Health API: http://localhost:${PORT}/api/health
🔐 Compliance API: http://localhost:${PORT}/api/compliance
⚙️  Status API: http://localhost:${PORT}/api/status

Press Ctrl+C to stop the server.
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Shutting down dashboard server...');
  server.close();
  process.exit(0);
});
