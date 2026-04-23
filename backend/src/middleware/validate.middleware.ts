import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

// Middleware genérico de validación — recibe un schema Zod y valida req.body
// Buena práctica: centralizar validación, nunca validar dentro del controller
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        ApiResponse.error(res, 'Validation failed', 422, errors);
        return;
      }
      next(error);
    }
  };
};
