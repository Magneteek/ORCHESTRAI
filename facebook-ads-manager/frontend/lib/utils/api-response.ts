import { NextResponse } from 'next/server';
import { ApiError } from './errors';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Creates a successful API response
 */
export function successResponse<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    meta?: ApiSuccessResponse<T>['meta'];
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.message && { message: options.message }),
    ...(options?.meta && { meta: options.meta }),
  };

  return NextResponse.json(response, { status: options?.status || 200 });
}

/**
 * Creates an error API response
 */
export function errorResponse(
  error: Error | ApiError,
  statusCode?: number
): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    };

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle unknown errors
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
    },
  };

  return NextResponse.json(response, { status: statusCode || 500 });
}

/**
 * Creates a paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  options?: {
    message?: string;
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return successResponse(data, {
    ...options,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    },
  });
}

/**
 * Creates a created (201) response
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, {
    status: 201,
    message: message || 'Resource created successfully',
  });
}

/**
 * Creates a no content (204) response
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
