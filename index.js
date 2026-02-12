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

// Serve static site content
app.use(express.static(path.join(__dirname, 'public')));

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
