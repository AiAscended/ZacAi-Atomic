// Minimal xterm.js client loader and websocket PTY connector
// Dynamically load xterm from CDN if not present
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
    const fitAddon = { fit: ()=>{} }; // lightweight: no fit addon required here
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
    window.addEventListener('resize', ()=>{ try{ const cols = Math.max(10, Math.floor(term._core._renderService.dimensions.actualCellWidth ? term.cols : 80)); ws.send('__RESIZE__:'+term.rows+':'+term.cols); }catch(e){} });
    // Focus input when clicking terminal
    termEl.addEventListener('click', ()=> term.focus());
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
