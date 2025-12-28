const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 4000;
const packagesDir = path.join(ROOT, 'packages');

function listPackages() {
  if (!fs.existsSync(packagesDir)) return [];
  return fs.readdirSync(packagesDir).filter(name => {
    const p = path.join(packagesDir, name);
    return fs.statSync(p).isDirectory();
  });
}

function packageStatus(name) {
  const pkgPath = path.join(packagesDir, name);
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  const distPath = path.join(pkgPath, 'dist');
  const srcPath = path.join(pkgPath, 'src');
  const hasPkg = fs.existsSync(pkgJsonPath);
  const hasDist = fs.existsSync(distPath);
  const hasSrc = fs.existsSync(srcPath);
  let pkgJson = null;
  try { pkgJson = hasPkg ? JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) : null; } catch(e) { pkgJson = { error: 'invalid package.json' }; }
  return {
    name,
    packageJson: pkgJson,
    hasSrc,
    hasDist,
    distFiles: hasDist ? fs.readdirSync(distPath) : [],
  };
}

function getStatus() {
  const pkgs = listPackages();
  const statuses = pkgs.map(packageStatus);
  const rootPkgExists = fs.existsSync(path.join(ROOT, 'package.json'));
  return { rootPkgExists, packages: statuses };
}

function renderIndex(status) {
  const rows = status.packages.map(p => {
    return `
      <tr>
        <td>${p.name}</td>
        <td>${p.packageJson ? (p.packageJson.version || '') : 'no package.json'}</td>
        <td>${p.hasSrc ? 'yes' : 'no'}</td>
        <td>${p.hasDist ? 'yes' : 'no'}</td>
        <td>${p.distFiles.join(', ')}</td>
      </tr>`;
  }).join('\n');

  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <title>ZacAi Preview Dashboard</title>
    <style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f2f2f2}</style>
  </head>
  <body>
    <h1>ZacAi Preview Dashboard</h1>
    <p>Root package.json: <strong>${status.rootPkgExists ? 'present' : 'missing'}</strong></p>
    <p>Server time: ${new Date().toISOString()}</p>
    <h2>Packages</h2>
    <table>
      <thead><tr><th>Package</th><th>Version</th><th>Has src/</th><th>Has dist/</th><th>Dist files</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <h2>Actions</h2>
    <ul>
      <li>To build packages, run: <code>npm run build</code> in repository root</li>
      <li>To install dependencies: <code>pnpm install</code> (recommended)</li>
      <li>To open this page automatically, use the host browser with: <code>$BROWSER http://127.0.0.1:${PORT}</code></li>
    </ul>

    <h2>Raw status JSON</h2>
    <pre id="json">${JSON.stringify(status, null, 2)}</pre>
  </body>
  </html>
  `;
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const status = getStatus();
    const html = renderIndex(status);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }
  if (req.url === '/status') {
    const status = getStatus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Preview server listening on http://127.0.0.1:${PORT}`);
});
