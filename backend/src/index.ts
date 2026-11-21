import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interviewRoutes';
import { initSocketIO } from './socket';
import { llmService } from './services/llmService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'PrepPulse - Multi-Level Technical Interview Platform API',
    author: 'Ankit Kumar Mishra',
    frontendUrl: 'http://localhost:3000',
    repository: 'https://github.com/mishraankit77/ai-interview-platform',
    endpoints: {
      health: '/health',
      roles: '/api/interview/roles',
      startInterview: 'POST /api/interview/start',
      submitAnswer: 'POST /api/interview/:id/answer',
      getSession: 'GET /api/interview/:id',
      getReport: 'GET /api/interview/:id/report'
    }
  });
});

// Healthcheck & metadata endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Multi-Agent AI Interview Platform Backend',
    author: 'Ankit Kumar Mishra',
    activeLLMProvider: llmService.getActiveProvider(),
    hasExternalApiKey: llmService.hasExternalKey(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Multi-Agent AI Interview Platform Backend',
    author: 'Ankit Kumar Mishra',
    activeLLMProvider: llmService.getActiveProvider(),
    hasExternalApiKey: llmService.hasExternalKey(),
    timestamp: new Date().toISOString()
  });
});

// Primary Interview API Routes
app.use('/api/interview', interviewRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.method} ${req.url}' not found.`
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error Handler]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Create HTTP and Socket.IO server
const server = http.createServer(app);
const io = initSocketIO(server, FRONTEND_URL);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  AI Interview Platform Backend - Production Server    `);
  console.log(`  Tailored for Ankit Kumar Mishra's Portfolio          `);
  console.log(`=======================================================`);
  console.log(`  [HTTP] Listening on: http://localhost:${PORT}`);
  console.log(`  [CORS] Allowed Origins: ${FRONTEND_URL}, localhost:5173`);
  console.log(`  [LLM] Active Provider: ${llmService.getActiveProvider()}`);
  console.log(`  [Socket.io] Realtime WebSocket gateway initialized`);
  console.log(`-------------------------------------------------------`);
  console.log(`  Available Routes:`);
  console.log(`  - GET  /health`);
  console.log(`  - GET  /api/interview/roles`);
  console.log(`  - POST /api/interview/start`);
  console.log(`  - POST /api/interview/:id/answer`);
  console.log(`  - GET  /api/interview/:id`);
  console.log(`  - GET  /api/interview/:id/report`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
const handleGracefulShutdown = (signal: string) => {
  console.log(`\n[Process] Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    console.log('[Process] HTTP and WebSocket server closed.');
    process.exit(0);
  });

  // Force close after 5 seconds if lingering connections exist
  setTimeout(() => {
    console.error('[Process] Forcing process shutdown after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export { app, server, io };
