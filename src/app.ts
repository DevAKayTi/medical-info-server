import 'express-async-errors';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';
import apiRouter from './routes/index';
import { env } from './config/env';

const createApp = (): Application => {
  const app = express();

  // ── Trust proxy (for rate limiting behind reverse proxy) ──
  app.set('trust proxy', 1);

  // ── Security headers ───────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: env.NODE_ENV === 'production',
    }),
  );

  // ── CORS ───────────────────────────────────────────────────
  app.use(cors(corsOptions));

  // ── Compression ────────────────────────────────────────────
  app.use(compression());

  // ── Request logging ────────────────────────────────────────
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  // ── Body parsers ───────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ── Rate limiting ──────────────────────────────────────────
  app.use('/api', apiLimiter);

  // ── API Routes ─────────────────────────────────────────────
  app.use('/api/v1', apiRouter);

  // ── Root health check ──────────────────────────────────────
  app.get('/', (_req, res) => {
    res.json({
      name: 'MediSource Global API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/v1/health',
    });
  });

  // ── 404 & Error handlers ───────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
