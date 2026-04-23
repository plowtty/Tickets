import { Role, TicketStatus, Priority } from '@prisma/client';

// Re-export de enums de Prisma para uso en toda la app
export { Role, TicketStatus, Priority };

// Payload del JWT Access Token
export interface JwtPayload {
  sub: string;   // userId
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Estructura de paginación estándar
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Filtros para listar tickets
export interface TicketFilters {
  status?: TicketStatus;
  priority?: Priority;
  assignedToId?: string;
  createdById?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
