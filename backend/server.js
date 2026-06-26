/**
 * AURAX Backend - Main Server Entry Point
 * Express + MongoDB + Socket.io + Node-cron
 * Port: 5000
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { mongoConnect } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notificationService = require('./services/notificationService');

// ─── Create Express App ────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Join user-specific room on connect
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`🔌 Socket: ${userId} joined room`);
  });
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Inject io into notification service
notificationService.init(io);

// ─── Middleware ────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`→ ${req.method} ${req.url}`);
    next();
  });
}

// ─── Health Check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'AURAX MLM Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ─── API Routes ───────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/user',        require('./routes/user'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet',      require('./routes/wallet'));
app.use('/api/stake',       require('./routes/stake'));
app.use('/api/mlm',         require('./routes/mlm'));
app.use('/api/admin',       require('./routes/admin'));

// Dev-only cron triggers
if (process.env.NODE_ENV === 'development') {
  app.use('/api/cron', require('./routes/cron'));
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await mongoConnect();

  // Load cron jobs AFTER DB is connected
  require('./cron/cronJobs');

  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║          AURAX Backend Server v1.0.0         ║
╠══════════════════════════════════════════════╣
║  🚀 Running on: http://localhost:${PORT}        ║
║  🗄️  MongoDB: Connected                       ║
║  ⏰ Cron Jobs: 20 jobs scheduled              ║
║  🔌 Socket.io: Live notifications active      ║
║  🌐 Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)}║
╚══════════════════════════════════════════════╝
    `);
  });
};

startServer();

module.exports = { app, server, io };
