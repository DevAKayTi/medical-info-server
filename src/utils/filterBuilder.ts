import { QueryOptions, ParsedQuery } from '../types/query.types';

export const parseQueryOptions = (query: Record<string, unknown>): ParsedQuery => {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10)));
  const skip = (page - 1) * limit;

  // Sort
  const sortField = String(query.sort ?? 'createdAt');
  const sortOrder: 1 | -1 = String(query.order ?? 'desc') === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  // Filter — collect non-pagination query params
  const reserved = new Set(['page', 'limit', 'sort', 'order', 'search']);
  const filter: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
    if (reserved.has(key) || value === undefined || value === '') continue;
    filter[key] = value;
  }

  // Search — applied upstream by each module (they know which fields to search)
  return { page, limit, skip, sort, filter };
};

export const buildSearchFilter = (
  search: string | undefined,
  fields: string[],
): Record<string, unknown> => {
  if (!search?.trim()) return {};

  const regex = { $regex: search.trim(), $options: 'i' };
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};
