export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  [key: string]: unknown;
}

export interface ParsedQuery {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
  filter: Record<string, unknown>;
}
