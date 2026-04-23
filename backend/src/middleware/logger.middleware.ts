import morgan from 'morgan';
import { Request } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

morgan.token('request-id', (req) => (req as Request).requestId ?? '-');

// Stream de Morgan hacia Winston para logs unificados
const stream = {
  write: (message: string) => logger.http(message.trim()),
};

export const httpLogger = morgan(
  env.IS_PRODUCTION
    ? ':remote-addr - :method :url :status :res[content-length] - :response-time ms reqId=:request-id'
    : ':method :url :status :response-time ms reqId=:request-id',
  { stream, skip: () => env.IS_TEST }
);
