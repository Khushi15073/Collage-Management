import { AppError } from "./errorClass";

export type PaginationQuery = {
  page?: unknown;
  limit?: unknown;
};

export type PaginationOptions = {
  page: number;
  limit: number;
  skip: number;
};

export function parsePaginationQuery(
  query: PaginationQuery,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): PaginationOptions {
  const defaultPage = defaults.page ?? 1;
  const defaultLimit = defaults.limit ?? 10;
  const maxLimit = defaults.maxLimit ?? 100;

  const page = Number(query.page ?? defaultPage);
  const limit = Number(query.limit ?? defaultLimit);

  if (!Number.isInteger(page) || page < 1) {
    throw AppError.badRequest("Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw AppError.badRequest(`Limit must be an integer between 1 and ${maxLimit}`);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
