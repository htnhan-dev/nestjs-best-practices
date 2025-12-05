import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { BaseResponse } from '@/common/base';
import { AppLoggerService } from '@/common/logger';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request } from 'express';

enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
}

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: AppLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const request = context.getRequest<Request | undefined>();
    const response = context.getResponse();

    //  Detect MongoDB duplicate key E11000
    if (
      exception instanceof Error &&
      'code' in exception &&
      exception['code'] === 11000
    ) {
      const duplicateMessage = this.extractDuplicateKeyMessage(exception);
      httpAdapter.reply(
        response,
        BaseResponse.fail(duplicateMessage, ErrorCode.CONFLICT),
        HttpStatus.CONFLICT,
      );
      return;
    }

    const { status, message } = this.normalizeException(exception);
    const errorCode = this.mapStatusToError(status);

    // Special Throttler
    if (exception instanceof ThrottlerException) {
      httpAdapter.reply(
        response,
        {
          success: false,
          message,
          error: ErrorCode.TOO_MANY_REQUESTS,
          retryAfter: 60,
          timestamp: new Date().toISOString(),
        },
        status,
      );
      return;
    }

    const _safeBody = this.safeBody(request?.body);
    const logMessage = Array.isArray(message) ? message.join(', ') : message;
    const stack =
      exception instanceof Error ? exception.stack : 'No stack trace';
    const requestId =
      (request as unknown as { requestId?: string }).requestId ?? 'no-rid';

    this.logger.error(
      `${request?.method ?? 'UNKNOWN'} ${request?.url ?? ''} -> ${logMessage} [req:${requestId}]`,
      stack,
      HttpExceptionsFilter.name,
    );

    httpAdapter.reply(response, BaseResponse.fail(message, errorCode), status);
  }

  // Extract readable duplicate key message
  private extractDuplicateKeyMessage(exception: unknown): string {
    try {
      if (!exception || typeof exception !== 'object') {
        return 'Duplicate key error';
      }

      const keyValue = (exception as { keyValue?: Record<string, unknown> })
        .keyValue;
      if (!keyValue || typeof keyValue !== 'object') {
        return 'Duplicate key error';
      }

      const key = Object.keys(keyValue)[0] ?? 'unknown';
      const value = keyValue;
      return `Duplicate value for ${key}: "${String(value[key])}"`;
    } catch {
      return 'Duplicate key error';
    }
  }

  private mapStatusToError(status: HttpStatus): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.TOO_MANY_REQUESTS;
      default:
        return ErrorCode.INTERNAL;
    }
  }

  private normalizeException(exception: unknown): {
    status: number;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') return { status, message: response };

      if (typeof response === 'object' && response !== null) {
        const rawMessage = (response as Record<string, unknown>).message;
        const message =
          Array.isArray(rawMessage) || typeof rawMessage === 'string'
            ? rawMessage
            : exception.message;

        return { status, message };
      }

      return { status, message: exception.message };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private safeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;

    const clone = { ...(body as Record<string, unknown>) };
    if ('password' in clone) clone.password = '***';
    if ('newPassword' in clone) clone.newPassword = '***';

    return clone;
  }
}
