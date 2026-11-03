const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('./build.js');

const PORT = process.env.PORT || 5173;
const DIST = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
};

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let cleanPath = urlPath === '/' ? '/index.html' : urlPath;
  let target = path.join(DIST, cleanPath);

  // If path has no extension and exists as .html (clean URLs)
  if (!path.extname(target) && fs.existsSync(target + '.html')) {
    target = target + '.html';
  } else if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    const indexPath = path.join(target, 'index.html');
    if (fs.existsSync(indexPath)) target = indexPath;
  }

  serveFile(req, res, target);
});

async function start() {
  await build();

  server.listen(PORT, () => {
    console.log(`\n  Local preview server running at:`);
    console.log(`  > Network: http://localhost:${PORT}/`);
    console.log(`  > Press Ctrl+C to stop.\n`);
  });

  // Watch for changes and rebuild
  const watchPaths = [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'contracts.html'),
    path.join(__dirname, 'style.css'),
    path.join(__dirname, 'main.js'),
    path.join(__dirname, 'public'),
  ];

  let debounceTimer = null;
  for (const p of watchPaths) {
    if (fs.existsSync(p)) {
      fs.watch(p, { recursive: true }, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          console.log('[dev] Change detected, rebuilding...');
          await build();
        }, 150);
      });
    }
  }
}

start().catch(err => {
  console.error('[dev] Failed to start dev server:', err);
  process.exit(1);
});

