import rateLimit from 'express-rate-limit';
import { env } from './env';

const skipRateLimit = () => !env.RATE_LIMIT_ENABLED;

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutos por defecto
  max: env.RATE_LIMIT_MAX,            // 100 requests por ventana
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// Límite más estricto para rutas de autenticación (previene brute force)
// Se puede desactivar con RATE_LIMIT_ENABLED=false
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again in 15 minutes.',
  },
});
