const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// Middleware för JSON parsing
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
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

// Status endpoint - enkel
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Readiness check - för container orchestration
app.get('/ready', (req, res) => {
  // Här kan du lägga till checks för databas, externa services etc.
  const ready = true; // Sätt till false om något kritiskt inte fungerar
  
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
    commit: process.env.COMMIT_SHA || 'unknown'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <h1>First Pipeline Challenge - Week 4</h1>
    <h2>Silver & Gold Edition 🥈🥇</h2>
    <ul>
      <li><a href="/health">Health Check</a></li>
      <li><a href="/status">Status</a></li>
      <li><a href="/ready">Readiness</a></li>
      <li><a href="/live">Liveness</a></li>
      <li><a href="/version">Version</a></li>
      <li><a href="/api/echo" style="color: #888;">/api/echo (POST)</a></li>
    </ul>
  `);
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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });
} else {
  // Export for testing
  module.exports = app;
}

module.exports = app;
