import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiResponse } from '../utils/apiResponse';

// Factory de middleware de roles — recibe los roles permitidos y retorna middleware
// Buena práctica: composición de middlewares en lugar de lógica if/else en controllers
export const requireRoles = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Unauthorized', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      ApiResponse.error(res, 'Forbidden: insufficient permissions', 403);
      return;
    }

    next();
  };
};

// Shortcuts convenientes
export const requireAdmin = requireRoles(Role.ADMIN);
export const requireAdminOrAgent = requireRoles(Role.ADMIN, Role.AGENT);
