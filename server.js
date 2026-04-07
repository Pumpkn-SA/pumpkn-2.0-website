const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Route mapping
  const routes = {
    '/': '/index.html',
    '/about-us/why-we-are': '/about-us/why-we-are.html',
    '/info-hub/case-studies': '/info-hub/case-studies.html',
    '/info-hub/articles': '/info-hub/articles.html',
    '/info-hub/careers': '/info-hub/careers.html',
    '/info-hub/faqs': '/info-hub/faqs.html',
    '/contact-us': '/contact-us/index.html',
    '/support': '/support/index.html',
    '/privacy-policy': '/privacy-policy/index.html',
    '/terms-conditions': '/terms-conditions/index.html',
  };

  // Check route mapping first
  if (routes[urlPath]) {
    urlPath = routes[urlPath];
  }

  // Try to serve the file
  let filePath = path.join(ROOT, urlPath);

  // If path is a directory, try index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If file doesn't exist, try adding .html
  if (!fs.existsSync(filePath)) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      filePath = htmlPath;
    }
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Pumpkn site running at http://localhost:${PORT}`);
});
