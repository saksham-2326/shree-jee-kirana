const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8080;
const DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.apk': 'application/vnd.android.package-archive',
};

// Discover local IPv4 addresses
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

const server = http.createServer((req, res) => {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0];
  const filePath = path.join(DIR, reqPath);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log('📱 SHREE JEE KIRANA - MOBILE APP PROTOTYPE SERVER');
  console.log('====================================================');
  console.log(`\n👉 Test on your Mobile Phone (Connected to same Wi-Fi):`);
  console.log(`   http://${localIp}:${PORT}`);
  console.log(`\n👉 Test on this PC Browser:`);
  console.log(`   http://localhost:${PORT}`);
  console.log('====================================================');
  console.log(`\n💡 TIP FOR MOBILE TESTING:`);
  console.log(`1. Ensure your phone is connected to the same Wi-Fi network.`);
  console.log(`2. Open Chrome or Safari on your phone and go to:`);
  console.log(`   http://${localIp}:${PORT}`);
  console.log(`3. Tap "Add to Home Screen" to install it as an app icon!`);
  console.log('====================================================\n');
});
