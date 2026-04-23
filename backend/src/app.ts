import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { httpLogger } from './middleware/logger.middleware';
import { requestContext } from './middleware/requestContext.middleware';
import { errorHandler } from './middleware/error.middleware';
import { generalLimiter } from './config/rateLimit';
import { env } from './config/env';
import routes from './routes';
import prisma from './config/database';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY);

// ─── Security Middleware ──────────────────────────────────────────────────────
// helmet: cabeceras HTTP de seguridad (X-Frame-Options, CSP, etc.)
app.use(helmet());

// cors: solo orígenes permitidos pueden hacer requests
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Necesario para cookies httpOnly
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(compression());             // Gzip responses
app.use(cookieParser());            // Parsear cookies (refresh token)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestContext);
app.use(httpLogger);                // Logs HTTP

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', routes);

// Health check — útil para deploys y load balancers
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      database: 'up',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  } catch {
    res.status(503).json({
      status: 'not_ready',
      database: 'down',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', requestId: req.requestId });
});

// ─── Error Handler (debe ir al final) ────────────────────────────────────────
app.use(errorHandler);

export default app;
