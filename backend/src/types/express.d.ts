import { Request } from 'express';
import { Role } from '@prisma/client';

// Extensión del tipo Request de Express para incluir el usuario autenticado
// Buena práctica: declaración de módulo en lugar de casting manual en cada controller
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}
