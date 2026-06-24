export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: ValidationError[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface MediaFile {
  url: string;
  publicId: string;
}

export interface MediaFileWithMeta extends MediaFile {
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  filename?: string;
}
