const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// Performance metrics
const metrics = {
  totalRequests: 0,
  responseTimes: [],
  statusCodes: {},
};

// Middleware för JSON parsing
app.use(express.json());

// Serve static site content (no-cache so Render always shows latest version)
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Pretty JSON middleware - renders HTML for browsers, raw JSON for API clients
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (req.headers.accept && req.headers.accept.includes('text/html') && req.path !== '/api/endpoints') {
      const title = req.path.replace('/', '').toUpperCase() || 'Response';
      const statusColor = res.statusCode >= 400 ? '#ff5f7a' : '#00d1a6';
      const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | I-C-your-I-D</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      color: #ecf4f8;
      background: radial-gradient(circle at 10% 10%, #13314a 0%, transparent 30%),
                  radial-gradient(circle at 90% 20%, #183a2f 0%, transparent 25%),
                  linear-gradient(140deg, #07131b, #0f1f2c);
      min-height: 100vh; display: grid; place-items: center; padding: 24px;
    }
    .wrap {
      width: min(720px, 100%); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px; background: rgba(8,17,24,0.72);
      backdrop-filter: blur(4px); box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      overflow: hidden;
    }
    .top {
      padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.12);
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
    }
    .top h1 { margin: 0; font-size: 22px; }
    .badge {
      border: 1px solid ${statusColor}; color: ${statusColor};
      border-radius: 999px; padding: 4px 12px; font-size: 12px;
      background: ${statusColor}22; font-weight: 700;
    }
    pre {
      margin: 0; padding: 24px; overflow-x: auto;
      font-size: 14px; line-height: 1.6; color: #b7c7d1;
    }
    .key { color: #00d1a6; }
    .str { color: #ffcc66; }
    .num { color: #7ec8e3; }
    .bool { color: #ff5f7a; }
    .null { color: #666; }
    .bar {
      padding: 14px 24px; border-top: 1px solid rgba(255,255,255,0.12);
      display: flex; gap: 10px; flex-wrap: wrap;
    }
    a {
      color: #ecf4f8; text-decoration: none; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px; padding: 6px 14px; font-size: 13px;
      background: rgba(255,255,255,0.03);
    }
    a:hover { border-color: #00d1a6; color: #00d1a6; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <h1>${req.method} ${req.path}</h1>
      <span class="badge">${res.statusCode}</span>
    </div>
    <pre>${syntaxHighlight(JSON.stringify(data, null, 2))}</pre>
    <div class="bar">
      <a href="/">&#8592; Dashboard</a>
      <a href="/health">/health</a>
      <a href="/metrics">/metrics</a>
      <a href="/status">/status</a>
      <a href="/version">/version</a>
    </div>
  </div>
</body>
</html>`;
      return res.type('html').send(html);
    }
    return originalJson(data);
  };
  next();
});

function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)"(?=\s*:)/g, '<span class="key">"$1"</span>')
    .replace(/:\s*"([^"]*)"/g, ': <span class="str">"$1"</span>')
    .replace(/:\s*(\d+)/g, ': <span class="num">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="bool">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="null">$1</span>');
}

// Request logging & metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  metrics.totalRequests++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.responseTimes.push(duration);
    // Keep only last 1000 entries
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift();
    }
    const code = res.statusCode;
    metrics.statusCodes[code] = (metrics.statusCodes[code] || 0) + 1;
  });

  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint - detaljerad
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Metrics endpoint - performance data
app.get('/metrics', (req, res) => {
  const times = metrics.responseTimes;
  const avg = times.length > 0
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : 0;
  const max = times.length > 0 ? Math.max(...times) : 0;
  const min = times.length > 0 ? Math.min(...times) : 0;

  res.json({
    totalRequests: metrics.totalRequests,
    uptime: `${Math.floor(process.uptime())}s`,
    responseTime: {
      avg: `${avg}ms`,
      min: `${min}ms`,
      max: `${max}ms`,
      samples: times.length
    },
    statusCodes: metrics.statusCodes,
    timestamp: new Date().toISOString()
  });
});

// Status endpoint - with secret easter egg
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    secret: [
      'You found the secret! Well done!',
      '',
      '     ,;;;, ,;;;,',
      "    ;;;' ';' ';;;",
      '    ;;;       ;;;',
      "     ';;,   ,;;'",
      "       ';;,;;'",
      "         ';'"
    ]
  });
});


// Readiness check - för container orchestration
app.get('/ready', (req, res) => {
  const ready = true;

  if (ready) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// Liveness check - verifierar att processen lever
app.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: process.env.VERSION || '1.0.0',
    build: process.env.BUILD_NUMBER || 'local',
    commit: process.env.COMMIT_SHA || 'unknown',
    runningSince: new Date(startTime).toISOString()
  });
});

// Easter egg endpoints
app.get('/secret', (req, res) => {
  res.json({
    message: 'You found the secret! Here\'s a cookie for your troubles',
    reward: [
      '  _____  ',
      ' /     \\ ',
      '| () () |',
      '|  ___  |',
      '|_______|',
      '',
      '    🍪    '
    ],
    hint: 'There are more secrets... try thinking like a gamer from the 80s'
  });
});

app.get('/konami', (req, res) => {
  res.json({
    code: '↑ ↑ ↓ ↓ ← → ← → B A',
    message: 'CHEAT MODE ACTIVATED! +30 lives',
    unlocked: [
      '  ★ ★ ★ ★ ★  ',
      '  KONAMI CODE  ',
      '  ★ ★ ★ ★ ★  '
    ],
    trivia: 'The Konami Code first appeared in Gradius (1986) for the NES'
  });
});

app.get('/coffee', (req, res) => {
  res.status(418).json({
    error: 'I\'m a teapot',
    statusCode: 418,
    coffee: [
      '       ( (   ',
      '        ) )  ',
      '      ....   ',
      '      |  |]  ',
      '      \\  /   ',
      '       `\'    '
    ],
    message: 'HTTP 418 - This server refuses to brew coffee because it is, permanently, a teapot.',
    rfc: 'RFC 2324'
  });
});

// Root fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint - exempel på enkel CRUD
app.post('/api/echo', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'Message is required',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    echo: message,
    receivedAt: new Date().toISOString()
  });
});

// API endpoint - list all registered routes dynamically
app.get('/api/endpoints', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase());
      routes.push({ method: methods.join(', '), path: middleware.route.path });
    }
  });
  res.json(routes);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  }
});

// Only start server if not being required as a module
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Started at: ${new Date().toISOString()}`);
  });
  // Graceful shutdown for started server
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    if (server) {
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    }
  });
}

// Export app for tests
module.exports = app;
