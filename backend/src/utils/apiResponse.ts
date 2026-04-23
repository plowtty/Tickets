import { Response } from 'express';
import { PaginationMeta } from '../types';

// Respuestas estandarizadas — todos los endpoints devuelven la misma forma
// Buena práctica: API contract consistente facilita el consumo en frontend
export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200, message?: string) {
    return res.status(statusCode).json({
      success: true,
      message: message ?? 'OK',
      data,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      data,
      pagination,
    });
  }

  static error(res: Response, message: string, statusCode = 400, errors?: unknown) {
    const payload: Record<string, unknown> = {
      success: false,
      message,
    };

    if (typeof errors !== 'undefined') {
      payload.errors = errors;
    }

    return res.status(statusCode).json({
      ...payload,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return ApiResponse.success(res, data, 201, message);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}
