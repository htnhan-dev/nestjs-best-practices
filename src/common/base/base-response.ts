export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BaseResponsePayload<T> {
  success: boolean;
  message?: string | string[];
  data?: T;
  meta?: PaginationMeta;
  timestamp?: string;
}

/**
 * Provides a consistent response envelope for HTTP endpoints.
 */
export class BaseResponse<T> {
  success: boolean;
  message?: string | string[];
  data?: T;
  meta?: PaginationMeta;
  timestamp: string;

  constructor({
    success,
    message,
    data,
    meta,
    timestamp,
  }: BaseResponsePayload<T>) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = timestamp ?? new Date().toISOString();
  }

  static ok<T>(
    data: T,
    message = 'Request completed successfully',
  ): BaseResponse<T> {
    return new BaseResponse<T>({ success: true, data, message });
  }

  static okWithMeta<T>(
    data: T,
    meta: PaginationMeta,
    message = 'Request completed successfully',
  ): BaseResponse<T> {
    return new BaseResponse<T>({ success: true, data, meta, message });
  }

  static fail<T>(message: string | string[]): BaseResponse<T> {
    return new BaseResponse<T>({ success: false, message });
  }
}
