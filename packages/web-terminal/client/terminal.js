// Minimal xterm.js client loader and websocket PTY connector
// Moved into packages/web-terminal for packaging consistency
(function(){
  const CSS = 'https://unpkg.com/xterm/css/xterm.css';
  const JS = 'https://unpkg.com/xterm/lib/xterm.js';
  function loadCSS(href){
    if(document.querySelector('link[data-xterm]')) return Promise.resolve();
    return new Promise((res)=>{const l=document.createElement('link'); l.rel='stylesheet'; l.href=href; l.setAttribute('data-xterm','1'); document.head.appendChild(l); l.onload=res;});
  }
  function loadJS(src){
    if(window.Terminal) return Promise.resolve();
    return new Promise((res,rej)=>{const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s);});
  }
  async function init(){
    try{ await loadCSS(CSS); await loadJS(JS);}catch(e){console.warn('Failed to load xterm from CDN',e); return;}
    const termEl = document.getElementById('terminal');
    if(!termEl) return;
    termEl.innerHTML='';
    const term = new window.Terminal({cols:80,rows:24,convertEol:true,theme:{background:'#001000'}});
    term.open(termEl);

    const protocol = (location.protocol === 'https:') ? 'wss' : 'ws';
    const wsUrl = protocol + '://' + location.host + '/ws/terminal';
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    ws.addEventListener('open', ()=>{ term.writeln('\x1b[32mConnected to ZacAi PTY\x1b[0m'); });
    ws.addEventListener('message',(evt)=>{
      const data = typeof evt.data === 'string' ? evt.data : new TextDecoder().decode(evt.data);
      try{ // attempt to parse JSON responses from fallback
        const j = JSON.parse(data);
        if(j.output) term.write('\r\n'+j.output+'\r\n$ ');
        else term.write(data);
      }catch(e){ term.write(data); }
    });
    ws.addEventListener('close', ()=> term.writeln('\r\n\x1b[31mDisconnected from PTY\x1b[0m'));
    term.onData(d=>{
      try{ ws.send(d); }catch(e){}
    });
    // Resize handling (best-effort)
    window.addEventListener('resize', ()=>{ try{ ws.send('__RESIZE__:'+term.rows+':'+term.cols); }catch(e){} });
    // Focus input when clicking terminal
    termEl.addEventListener('click', ()=> term.focus());
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
import { Terminal } from 'xterm';
import FitAddon from '@xterm/addon-fit';

export class WebTerminal {
  constructor({ container, wsEndpoint = '/ws/terminal', apiEndpoint = '/api/terminal', adminToken = '' } = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.wsEndpoint = (location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.host + wsEndpoint;
    this.apiEndpoint = apiEndpoint;
    this.adminToken = adminToken || localStorage.getItem('ADMIN_TOKEN') || '';
    this.term = new Terminal({ cols: 80, rows: 24, convertEol: true });
    this.fit = new FitAddon();
    this.term.loadAddon(this.fit);
    this._buffer = '';
  }

  open() {
    this.term.open(this.container);
    this.fit.fit();
    this.term.writeln('ZacAi WebTerminal connected. Type commands and press Enter.');
    this._connectWS();
    this.term.onData(d => this._handleData(d));
    window.addEventListener('resize', () => this.fit.fit());
  }

  _handleData(d) {
    // simple line buffer until Enter
    if (d === '\r') {
      const cmd = this._buffer.trim();
      this._buffer = '';
      if (!cmd) { this.term.write('\r\n'); return; }
      this.term.write('\r\n$ ' + cmd + '\r\n');
      this._sendCommand(cmd);
    } else if (d === '\u007f') { // backspace
      if (this._buffer.length > 0) {
        this._buffer = this._buffer.slice(0, -1);
        this.term.write('\b \b');
      }
    } else {
      this._buffer += d;
      this.term.write(d);
    }
  }

  _connectWS() {
    try {
      this.ws = new WebSocket(this.wsEndpoint);
      this.ws.addEventListener('open', () => { this.term.writeln('[ws] connected'); });
      this.ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'output') this.term.writeln(msg.text);
          else if (msg.type === 'ack') this.term.writeln('[ack] ' + msg.cmd);
          else if (msg.type === 'error') this.term.writeln('[error] ' + msg.message);
        } catch (e) { this.term.writeln(ev.data); }
      });
      this.ws.addEventListener('close', () => { this.term.writeln('[ws] disconnected'); });
    } catch (e) {
      this.term.writeln('[ws] unable to connect: ' + e.message);
    }
  }

  _sendCommand(cmd) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ cmd, token: this.adminToken }));
      return;
    }
    // fallback to HTTP POST
    fetch(this.apiEndpoint, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, this.adminToken ? { 'Authorization': 'Bearer ' + this.adminToken } : {}), body: JSON.stringify({ cmd }) })
      .then(r => r.json()).then(j => this.term.writeln(typeof j.output === 'string' ? j.output : JSON.stringify(j.output, null, 2))).catch(e => this.term.writeln('[http-error] ' + e.message));
  }
}

export default WebTerminal;
