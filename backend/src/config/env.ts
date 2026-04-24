import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const normalizeDatabaseUrl = (databaseUrl: string) => {
  try {
    const parsedUrl = new URL(databaseUrl);
    if (parsedUrl.searchParams.get('channel_binding') === 'require') {
      parsedUrl.searchParams.delete('channel_binding');
    }
    return parsedUrl.toString();
  } catch {
    return databaseUrl;
  }
};

// Validación estricta de variables de entorno con Zod
// Buena práctica: fallar en startup si falta algo crítico, no en runtime
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  TRUST_PROXY: z.string().default('false'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().default('12'),
  CORS_ORIGIN: z.string().default('http://localhost:5180'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_ENABLED: z.string().optional(),
  LOGIN_MAX_ATTEMPTS: z.string().default('5'),
  LOGIN_LOCK_MINUTES: z.string().default('15'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const normalizedDatabaseUrl = normalizeDatabaseUrl(parsed.data.DATABASE_URL);
process.env.DATABASE_URL = normalizedDatabaseUrl;

export const env = {
  ...parsed.data,
  DATABASE_URL: normalizedDatabaseUrl,
  PORT: parseInt(parsed.data.PORT, 10),
  BCRYPT_ROUNDS: parseInt(parsed.data.BCRYPT_ROUNDS, 10),
  RATE_LIMIT_WINDOW_MS: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
  RATE_LIMIT_MAX: parseInt(parsed.data.RATE_LIMIT_MAX, 10),
  LOGIN_MAX_ATTEMPTS: parseInt(parsed.data.LOGIN_MAX_ATTEMPTS, 10),
  LOGIN_LOCK_MINUTES: parseInt(parsed.data.LOGIN_LOCK_MINUTES, 10),
  TRUST_PROXY:
    parsed.data.TRUST_PROXY === 'true'
      ? true
      : parsed.data.TRUST_PROXY === 'false'
        ? false
        : Number(parsed.data.TRUST_PROXY),
  RATE_LIMIT_ENABLED:
    parsed.data.RATE_LIMIT_ENABLED !== undefined
      ? parsed.data.RATE_LIMIT_ENABLED === 'true'
      : parsed.data.NODE_ENV !== 'development',
  IS_PRODUCTION: parsed.data.NODE_ENV === 'production',
  IS_TEST: parsed.data.NODE_ENV === 'test',
};
