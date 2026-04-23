import { PaginationMeta, PaginationParams } from '../types';

export const getPaginationParams = (
  page?: string | number,
  limit?: string | number
): PaginationParams => {
  const parsedPage = Math.max(1, parseInt(String(page ?? 1), 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit ?? 10), 10) || 10));
  return { page: parsedPage, limit: parsedLimit };
};

export const getPaginationSkip = ({ page, limit }: PaginationParams): number => {
  return (page - 1) * limit;
};

export const buildPaginationMeta = (
  total: number,
  params: PaginationParams
): PaginationMeta => {
  const totalPages = Math.ceil(total / params.limit);
  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  };
};
