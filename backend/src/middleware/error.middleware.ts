import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

// Clase base para errores de aplicación con statusCode
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Manejador global de errores — SIEMPRE debe ser el último middleware
// Buena práctica: distinguir errores operacionales (esperados) de programáticos
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const requestId = req.requestId ?? 'unknown';

  // Error de Prisma: violación de unique constraint
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] ?? 'field';
      ApiResponse.error(res, `A record with this ${field} already exists`, 409, { requestId });
      return;
    }
    if (prismaError.code === 'P2025') {
      ApiResponse.error(res, 'Record not found', 404, { requestId });
      return;
    }
  }

  if (err instanceof AppError) {
    if (!env.IS_PRODUCTION) {
      logger.warn(`[AppError] reqId=${requestId} ${err.message}`, { statusCode: err.statusCode });
    }
    ApiResponse.error(res, err.message, err.statusCode, { requestId });
    return;
  }

  // Error no esperado — loguear completo
  logger.error(`Unhandled error reqId=${requestId}:`, err);

  ApiResponse.error(
    res,
    env.IS_PRODUCTION ? 'Internal server error' : err.message,
    500,
    { requestId }
  );
};
