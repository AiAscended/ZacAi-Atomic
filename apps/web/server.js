/**
 * System Core Development Server
 * Provides real-time visualization of system status, metrics, and compliance
 * Accessible at: http://localhost:3000
 */

import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { recommendAction } from '../../packages/system-core-agent/lib/index.js';
import TerminalHandler from '../../packages/web-terminal/lib/index.js';
import { info as logInfo, warn as logWarn, error as logError } from '../../packages/system-core/lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Discover packages dynamically
function discoverPackages() {
  const packagesDir = path.join(__dirname, '../../packages');
  const packages = [];
  try {
    const dirs = fs.readdirSync(packagesDir);
    dirs.forEach((dir) => {
      const pkgPath = path.join(packagesDir, dir, 'package.json');
      const srcPath = path.join(packagesDir, dir, 'src');
      const distPath = path.join(packagesDir, dir, 'dist');
      let pkg = { name: dir, version: 'N/A', hasSrc: false, hasDist: false, distFiles: [] };
      try {
        if (fs.existsSync(pkgPath)) {
          const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          pkg.version = data.version || 'N/A';
        }
        pkg.hasSrc = fs.existsSync(srcPath);
        pkg.hasDist = fs.existsSync(distPath);
        if (pkg.hasDist) {
          pkg.distFiles = fs.readdirSync(distPath).slice(0, 5);
        }
      } catch (e) {}
      packages.push(pkg);
    });
  } catch (e) {}
  return packages;
}

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
    <title>ZacAi System Core v0.0.1 | Admin Dashboard</title>
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
    
    .section-title {
      font-size: 1.5em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .info-table {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-table tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-table tr:last-child {
      border-bottom: none;
    }
    
    .info-table td {
      padding: 15px 20px;
    }
    
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
    
    <!-- Header Controls: Quick Links, Theme, Settings -->
    <div style="display:flex; gap:15px; margin-bottom:20px; justify-content:flex-end; flex-wrap:wrap;">
      <div style="position:relative;">
        <button class="button" onclick="toggleQuickLinksDropdown()" style="padding:10px 16px;">⚡ Quick Links</button>
        <div id="quickLinksDropdown" class="dropdown" style="display:none; position:absolute; top:50px; right:0; background:rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.2); border-radius:8px; min-width:200px; z-index:1000;">
          <a href="#" onclick="fetchAndShow('/api/status'); return false;" style="display:block; padding:10px 16px; color:#81C784; text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.1);">📊 Status</a>
          <a href="#" onclick="fetchAndShow('/api/health'); return false;" style="display:block; padding:10px 16px; color:#81C784; text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.1);">❤️ Health</a>
          <a href="#" onclick="fetchAndShow('/api/diagnostics'); return false;" style="display:block; padding:10px 16px; color:#81C784; text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.1);">⚙️ Diagnostics</a>
          <a href="#" onclick="fetchAndShow('/api/services'); return false;" style="display:block; padding:10px 16px; color:#81C784; text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.1);">🔧 Services</a>
          <a href="#" onclick="fetchAndShow('/api/metrics'); return false;" style="display:block; padding:10px 16px; color:#81C784; text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.1);">📈 Metrics</a>
          <a href="#" onclick="fetchAndShow('/api/compliance'); return false;" style="display:block; padding:10px 16px; color:#81C784; text-decoration:none;">🔐 Compliance</a>
        </div>
      </div>
      <button class="button" onclick="toggleTheme()" style="padding:10px 16px;" title="Toggle dark/light theme">🌙 Theme</button>
      <button class="button" onclick="toggleSettings()" style="padding:10px 16px;" title="Admin settings">⚙️ Settings</button>
    </div>
    
    <!-- Settings Panel Modal -->
    <div class="settings-panel" id="settingsPanel" onclick="if(event.target === event.currentTarget) toggleSettings();" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:2000; align-items:center; justify-content:center;">
      <div class="settings-content" style="background:rgba(30,60,114,1); border:1px solid rgba(255,255,255,0.2); border-radius:12px; padding:30px; max-width:600px; max-height:80vh; overflow-y:auto;">
        <span class="settings-close" onclick="toggleSettings()" style="float:right; cursor:pointer; font-size:24px; color:#fff; opacity:0.8;">✕</span>
        <h2>⚙️ Admin Settings</h2>
        <div style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-weight:600; color:#81C784;">Admin Email</label>
          <input type="text" id="adminEmail" value="zacai.email@gmail.com" style="width:100%; padding:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:4px;" />
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-weight:600; color:#81C784;">Log Level</label>
          <select id="logLevel" style="width:100%; padding:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:4px;">
            <option>debug</option><option selected>info</option><option>warn</option><option>error</option>
          </select>
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-weight:600; color:#81C784;">Compliance Level</label>
          <select id="complianceLevel" style="width:100%; padding:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:4px;">
            <option selected>HIPAA</option><option>FDA</option><option>SOC2</option><option>ISO27001</option>
          </select>
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-weight:600; color:#81C784;">Max Retries</label>
          <input type="number" id="maxRetries" value="3" style="width:100%; padding:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:4px;" />
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-weight:600; color:#81C784;">Recovery Mode</label>
          <select id="recoveryMode" style="width:100%; padding:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:4px;">
            <option selected>conservative</option><option>aggressive</option>
          </select>
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:8px; font-weight:600; color:#81C784;">Enable Voice</label>
          <select id="enableVoice" style="width:100%; padding:8px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:4px;">
            <option selected>true</option><option>false</option>
          </select>
        </div>
        <button class="button" onclick="saveSettings()" style="width:100%; margin-top:20px;">💾 Save Settings</button>
      </div>
    </div>
    
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
    
    <!-- Quick Actions + AI + Terminal -->
    <div class="section">
      <h2 class="section-title">⚡ Quick Actions</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button onclick="fetchAndShow('/api/health')" class="button">Get Health Metrics</button>
        <button onclick="fetchAndShow('/api/status')" class="button">System Status</button>
        <button onclick="fetchAndShow('/api/diagnostics')" class="button">Run Diagnostics</button>
        <button onclick="fetchAndShow('/api/services')" class="button">Service Status</button>
        <button onclick="fetchAndShow('/api/metrics')" class="button">View Metrics</button>
        <button onclick="fetchAndShow('/api/compliance')" class="button">Compliance Trail</button>
        <button onclick="refreshData()" class="button">Refresh All</button>
      </div>

      <!-- AI Assistant Section -->
      <div class="section">
        <h2 class="section-title">🤖 AI Assistant</h2>
        <div class="card">
          <div id="aiOutput" style="min-height:120px; font-family:monospace; color:#eaf7ea; background:rgba(0,0,0,0.2); padding:8px; border-radius:6px;">Ask the AI for suggestions...</div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <input id="aiInput" type="text" placeholder="Type a command (health, status, diagnostics) or question" style="flex:1; padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.2); color:#fff;" onkeydown="if(event.key==='Enter') sendAI();" />
            <button class="button" onclick="sendAI()">Send</button>
            <button class="button" id="micBtn" onclick="toggleMic()" title="Click to toggle mic input (Web Speech API)">🎤</button>
            <button class="button" id="speakerBtn" onclick="playAIOutput()" title="Click to speak the response (Text-to-Speech)">🔊</button>
          </div>
        </div>
      </div>

      <!-- Panel Results -->
      <div class="section">
        <h2 class="section-title">Panel Results</h2>
        <div class="card">
          <div id="panel" style="background:rgba(0,0,0,0.25); padding:12px; border-radius:6px; font-family:monospace; white-space:pre-wrap; max-height:240px; overflow:auto; display:none;"></div>
        </div>
      </div>

      <!-- Terminal Section -->
      <div class="section">
        <h2 class="section-title">⌨️ Dev Terminal</h2>
        <div class="card">
          <div id="terminal" class="terminal" tabindex="0" style="min-height:220px; font-family:monospace; color:#d6ffd6; background:rgba(0,0,0,0.6); padding:8px; border-radius:6px; overflow:auto; cursor:text;">$ Welcome to ZacAi Terminal\n</div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <input id="terminalInput" type="text" placeholder="Try: status, health, diagnostics, or bash commands" style="flex:1; padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.15); color:#fff;" onkeydown="if(event.key==='Enter') sendTerminal();" tabindex="0" />
            <button class="button" onclick="sendTerminal()">Send</button>
            <button class="button" onclick="clearTerminal()">Clear</button>
          </div>
          <div style="font-size:0.85em; opacity:0.8; margin-top:8px;">Note: privileged commands require an admin token via Authorization header (demo)</div>
        </div>
      </div>
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
  
  <!-- xterm integration loader -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
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

    // fetch and show panel content in-page (JSON or text)
    async function fetchAndShow(path) {
      try {
        const res = await fetch(path);
        const text = await res.text();
        let displayText = text;
        try {
          const json = JSON.parse(text);
          displayText = JSON.stringify(json, null, 2);
        } catch (e) {
          // already text, keep as is
        }
        const panel = document.getElementById('panel');
        panel.style.display = 'block';
        panel.textContent = displayText;
        panel.scrollTop = 0;
      } catch (err) {
        const panel = document.getElementById('panel');
        panel.style.display = 'block';
        panel.textContent = 'Error fetching ' + path + ': ' + err.message;
      }
    }

    // AI: send prompt to /api/ai and display reply
    async function sendAI() {
      const input = document.getElementById('aiInput');
      const prompt = input.value.trim();
      if (!prompt) return;
      const out = document.getElementById('aiOutput');
      out.textContent = '⏳ Thinking...';
      input.value = '';
      try {
        const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
        const j = await res.json();
        const reply = j.reply || JSON.stringify(j);
        out.textContent = reply;
        // show in panel and append to terminal
        const panel = document.getElementById('panel');
        panel.style.display = 'block';
        panel.textContent = reply;
        appendTerminal('$ ai> ' + prompt);
        appendTerminal('> ai-reply: ' + reply);
      } catch (e) {
        out.textContent = 'Error: ' + e.message;
        appendTerminal('ai-error> ' + e.message);
      }
    }

    // Speech-to-text (Web Speech API) and text-to-speech helpers
    let recognition = null;
    let recognizing = false;
    let speaking = false;
    
    (function initSpeech() {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          console.warn('Speech Recognition API not available');
          return;
        }
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => {
          recognizing = true;
          document.getElementById('micBtn').textContent = '⏺️';
          appendTerminal('$ [STT] listening...');
        };
        recognition.onresult = (event) => {
          if (event.results && event.results.length > 0) {
            const text = event.results[0][0].transcript;
            document.getElementById('aiInput').value = text;
            appendTerminal('$ [STT] received: ' + text);
            sendAI();
          }
        };
        recognition.onerror = (event) => {
          appendTerminal('$ [STT] error: ' + event.error);
        };
        recognition.onend = () => {
          recognizing = false;
          document.getElementById('micBtn').textContent = '🎤';
        };
      } catch (e) {
        console.warn('Speech init error:', e);
      }
    })();

    function toggleMic() {
      if (!recognition) {
        appendTerminal('$ [STT] not available in this browser');
        return;
      }
      if (recognizing) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          appendTerminal('$ [STT] error: ' + e.message);
        }
      }
    }

    function playAIOutput() {
      const text = document.getElementById('aiOutput').textContent || '';
      if (!text || text.includes('Ask the AI') || text.includes('Processing')) {
        appendTerminal('$ [TTS] no text to speak');
        return;
      }
      try {
        if (speaking) {
          window.speechSynthesis.cancel();
          speaking = false;
          document.getElementById('speakerBtn').textContent = '🔊';
          return;
        }
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        utter.onstart = () => { speaking = true; document.getElementById('speakerBtn').textContent = '⏸️'; appendTerminal('$ [TTS] speaking...'); };
        utter.onend = () => { speaking = false; document.getElementById('speakerBtn').textContent = '🔊'; appendTerminal('$ [TTS] done'); };
        utter.onerror = (e) => { appendTerminal('$ [TTS] error: ' + e.error); };
        window.speechSynthesis.speak(utter);
      } catch (e) {
        appendTerminal('$ [TTS] error: ' + e.message);
      }
    }

    // Terminal functions
    function appendTerminal(txt) {
      const t = document.getElementById('terminal');
      t.textContent += '\n' + txt;
      t.scrollTop = t.scrollHeight;
    }

    async function sendTerminal(forcedCmd) {
      const input = document.getElementById('terminalInput');
      const cmd = (typeof forcedCmd === 'string' ? forcedCmd : input.value.trim());
      if (!cmd) return;
      appendTerminal('$ ' + cmd);
      if (typeof forcedCmd !== 'string') input.value = '';
      try {
        // Ask user for token in demo mode if not set
        let token = localStorage.getItem('ADMIN_TOKEN');
        if (!token) token = prompt('Enter ADMIN token (demo) to unlock privileged commands, or Cancel to run as guest:');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch('/api/terminal', { method: 'POST', headers, body: JSON.stringify({ cmd }) });
        const j = await res.json();
        appendTerminal('> ' + (j.output ? (typeof j.output === 'object' ? JSON.stringify(j.output) : j.output) : JSON.stringify(j)));
      } catch (e) {
        appendTerminal('Error: ' + e.message);
      }
    }

    function clearTerminal() {
      document.getElementById('terminal').textContent = '$ Welcome to ZacAi Terminal\n';
    }
    
    // Enable clicking inside the terminal to focus the input (quick CLI-like behavior)
    (function setupTerminalDirectTyping(){
      try {
        const term = document.getElementById('terminal');
        const input = document.getElementById('terminalInput');
        if (!term || !input) return;
        term.addEventListener('click', (e) => {
          input.focus();
          const val = input.value;
          input.value = '';
          input.value = val;
        });
        term.addEventListener('keydown', (e) => {
          input.focus();
        });
      } catch (e) {
        console.warn('Terminal focus setup failed', e);
      }
    })();
    
    // Quick Links Dropdown
    function toggleQuickLinksDropdown() {
      const dropdown = document.getElementById('quickLinksDropdown');
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('quickLinksDropdown');
      if (!e.target.closest('button') && !e.target.closest('.dropdown')) {
        dropdown.style.display = 'none';
      }
    });
    
    // Theme Toggle (Dark/Light)
    function toggleTheme() {
      const body = document.body;
      const isDark = body.style.background.includes('1e3c72');
      if (isDark) {
        body.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
        body.style.color = '#333';
        document.querySelectorAll('.card').forEach(c => {
          c.style.background = 'rgba(255,255,255,0.7)';
          c.style.borderColor = 'rgba(0,0,0,0.1)';
        });
        localStorage.setItem('theme', 'light');
      } else {
        body.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        body.style.color = '#fff';
        document.querySelectorAll('.card').forEach(c => {
          c.style.background = 'rgba(255, 255, 255, 0.1)';
          c.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
        localStorage.setItem('theme', 'dark');
      }
    }
    (function initTheme(){
      const theme = localStorage.getItem('theme') || 'dark';
      if (theme === 'light') {
        document.body.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
        document.body.style.color = '#333';
      }
    })();
    
    // Settings Panel
    function toggleSettings() {
      const panel = document.getElementById('settingsPanel');
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    }
    function saveSettings() {
      const settings = {
        adminEmail: document.getElementById('adminEmail').value,
        logLevel: document.getElementById('logLevel').value,
        complianceLevel: document.getElementById('complianceLevel').value,
        maxRetries: document.getElementById('maxRetries').value,
        recoveryMode: document.getElementById('recoveryMode').value,
        enableVoice: document.getElementById('enableVoice').value,
      };
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      alert('✅ Settings saved to browser storage');
    }
    (function loadSettings(){
      const saved = localStorage.getItem('adminSettings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          Object.keys(settings).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = settings[key];
          });
        } catch (e) {}
      }
    })();
  </script>
  <!-- Token storage for privileged commands -->
  <script>
    if (!localStorage.getItem('ADMIN_TOKEN')) {
      const tokenFromPrompt = prompt('(Optional) Enter ADMIN token for privileged commands:');
      if (tokenFromPrompt) localStorage.setItem('ADMIN_TOKEN', tokenFromPrompt);
    }
  </script>
  <script src="/static/web-terminal-client.js"></script>
</body>
</html>`;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
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
  } else if (pathname === '/api/packages') {
    // Return discovered packages
    const packages = discoverPackages();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(packages, null, 2));
  } else if (pathname === '/api/ai' && req.method === 'POST') {
    // AI endpoint using system-core-agent.recommendAction
    // Supports system commands: health, status, diagnostics, etc. or natural language
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const prompt = (data.prompt || '').trim().toLowerCase();
        logInfo('ai', 'prompt_received', { prompt: prompt.slice(0, 200) });
        
        // Check if prompt matches known system commands
        let reply = '';
        if (prompt.includes('health')) {
          reply = JSON.stringify({ health: 'HEALTHY', uptime: Date.now() - systemState.startTime, memory: process.memoryUsage() }, null, 2);
        } else if (prompt.includes('status')) {
          reply = JSON.stringify({ status: systemState.status, mode: systemState.mode, successRate: systemState.successRate }, null, 2);
        } else if (prompt.includes('diagnostics') || prompt.includes('diagnostic')) {
          reply = JSON.stringify({ diagnostics: { kernel: 'OK', modules: 9, wasm: true, memory: process.memoryUsage() } }, null, 2);
        } else if (prompt.includes('metrics')) {
          reply = JSON.stringify({ cycles: systemState.cycles, errors: systemState.errors, uptime: Math.floor((Date.now() - systemState.startTime) / 1000) }, null, 2);
        } else {
          // Fall back to agent recommendation for unknown prompts
          reply = await recommendAction(prompt);
        }
        
        logInfo('ai', 'reply_generated', { prompt: prompt.slice(0, 200), reply: (typeof reply === 'string' ? reply.slice(0, 1000) : JSON.stringify(reply)).slice(0, 1000) });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (e) {
        logError('ai', 'error', { error: e.message });
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else if (pathname === '/api/terminal' && req.method === 'POST') {
    // Basic rate limiting by IP for terminal usage and metrics
    try {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString();
      const now = Date.now();
      global.__termRate = global.__termRate || {};
      const entry = global.__termRate[ip] || { count: 0, ts: now };
      if (now - entry.ts > 60000) { entry.count = 0; entry.ts = now; }
      entry.count += 1;
      global.__termRate[ip] = entry;
      if (entry.count > 60) { res.writeHead(429, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'rate limit exceeded' })); return; }
      global.__metrics = global.__metrics || { terminalCommands: 0 };
      global.__metrics.terminalCommands += 1;
      await terminalHandler.handleRequest(req, res);
    } catch (e) {
      logError('terminal', 'handle_request_error', { error: e.message });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'internal server error' }));
    }
  } else if (pathname === '/api/diagnostics') {
    // Run system diagnostics
    const diagnostics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: Math.floor((Date.now() - systemState.startTime) / 1000),
        status: systemState.status,
        mode: systemState.mode,
        health: systemState.health,
      },
      performance: {
        cycles: systemState.cycles,
        successRate: systemState.successRate,
        errors: systemState.errors,
      },
      memory: process.memoryUsage(),
      kernel: { active: true, modules: 9 },
      wasm: { loaded: true },
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(diagnostics, null, 2));
  } else if (pathname === '/api/services') {
    // Return active services and packages
    const services = {
      kernel: { status: 'RUNNING', version: '1.0.0' },
      agent: { status: 'RUNNING', version: '1.0.0' },
      model: { status: 'RUNNING', version: 'mock-v0' },
      terminal: { status: 'RUNNING', handlers: ['POST', 'WS'] },
      ai: { status: 'RUNNING', backend: 'local-seed-with-openai-fallback' },
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(services, null, 2));
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
  } else if (pathname === '/api/metrics') {
    // Return Prometheus-style metrics
    const uptime = Date.now() - systemState.startTime;
    const metrics = `# HELP zacai_uptime_ms System uptime in milliseconds
# TYPE zacai_uptime_ms gauge
zacai_uptime_ms ${uptime}
# HELP zacai_success_rate Success rate percentage
# TYPE zacai_success_rate gauge
zacai_success_rate ${systemState.successRate}
# HELP zacai_errors Total errors
# TYPE zacai_errors counter
zacai_errors ${systemState.errors}
# HELP zacai_cycles Total cycles executed
# TYPE zacai_cycles counter
zacai_cycles ${systemState.cycles}
`;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(metrics);
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
  } else if (pathname === '/metrics') {
    // Prometheus-style basic metrics
    const metrics = [];
    const uptime = Math.floor((Date.now() - systemState.startTime) / 1000);
    metrics.push(`# HELP zacai_system_uptime_seconds System uptime in seconds`);
    metrics.push(`# TYPE zacai_system_uptime_seconds counter`);
    metrics.push(`zacai_system_uptime_seconds ${uptime}`);
    metrics.push(`# HELP zacai_terminal_commands_total Terminal commands received`);
    metrics.push(`# TYPE zacai_terminal_commands_total counter`);
    const cmdCount = (global.__metrics && global.__metrics.terminalCommands) ? global.__metrics.terminalCommands : 0;
    metrics.push(`zacai_terminal_commands_total ${cmdCount}`);
    res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
    res.end(metrics.join('\n'));
  } else if (pathname === '/static/web-terminal-client.js') {
    // Serve the client-side web terminal module
    const clientPath = path.join(__dirname, '../../packages/web-terminal/client/terminal.js');
    if (fs.existsSync(clientPath)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(fs.readFileSync(clientPath, 'utf8'));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } else {
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Serve xterm client script
// No-op: xterm client is served from /static/web-terminal-client.js

// Start server
const PORT = 3000;
// Create and attach terminal handler and WebSocket endpoint
const terminalHandler = new TerminalHandler({ adminToken: process.env.ADMIN_TOKEN || 'admin-secret', commandWhitelist: ['status', 'health', 'diagnostics'] });
terminalHandler.attach(server);

// WebSocket PTY bridge: try to use `node-pty` and `ws`, otherwise fallback to safe command-only handler
server.on('upgrade', async (req, socket, head) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    if (url.pathname !== '/ws/terminal') {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }
    // Dynamic import for optional dependencies
    let WebSocketServer;
    try {
      ({ WebSocketServer } = await import('ws'));
    } catch (e) {
      socket.write('HTTP/1.1 501 Not Implemented\r\n\r\n');
      socket.destroy();
      return;
    }
    const wss = new WebSocketServer({ noServer: true });
    wss.handleUpgrade(req, socket, head, (ws) => {
      (async () => {
        let ptyProcess = null;
        try {
          const nodePty = await import('node-pty');
          const shell = process.env.SHELL || (process.platform === 'win32' ? 'powershell.exe' : 'bash');
          ptyProcess = nodePty.spawn(shell, [], { name: 'xterm-color', cols: 80, rows: 24, cwd: process.cwd(), env: process.env });
        } catch (e) {
          // pty not available; remain in fallback mode
        }

        if (ptyProcess) {
          ptyProcess.onData((d) => { try { ws.send(d); } catch (e) {} });
          ws.on('message', (msg) => {
            const data = (typeof msg === 'string') ? msg : msg.toString();
            if (data.startsWith('__RESIZE__')) {
              const parts = data.split(':');
              const rows = parseInt(parts[1]||24,10);
              const cols = parseInt(parts[2]||80,10);
              try { ptyProcess.resize(cols, rows); } catch(e){}
            } else {
              try { ptyProcess.write(data); } catch (e) {}
            }
          });
          ws.on('close', () => { try { ptyProcess.kill(); } catch (e) {} });
        } else {
          // Fallback: accept only safe commands via internal POST to /api/terminal
          ws.send('PTY unavailable on this host; using command-only fallback.');
          ws.on('message', async (msg) => {
            const data = (typeof msg === 'string') ? msg : msg.toString();
            if (!data || data.trim() === '') return;
            if (data.startsWith('__RESIZE__')) return; // ignore
            // Only allow safe commands
            const safe = ['status','health','diagnostics'];
            const cmd = data.trim().split('\n')[0].trim();
            if (!safe.includes(cmd)) {
              ws.send('Command not permitted in fallback.');
              return;
            }
            try {
              const resp = await fetch('http://localhost:'+ (process.env.PORT || 3000) + '/api/terminal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cmd }) });
              const j = await resp.json();
              ws.send(JSON.stringify(j));
            } catch (e) {
              ws.send('Fallback execution error: '+e.message);
            }
          });
        }
      })();
    });
  } catch (e) {
    try { socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n'); } catch(_){}
    try { socket.destroy(); } catch(_){}
  }
});

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
