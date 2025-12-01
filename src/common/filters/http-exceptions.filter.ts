import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { AppLoggerService } from '@/common/logger';
import { BaseResponse } from '@/common/base';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request } from 'express';

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

    const { status, message } = this.normalizeException(exception);

    // Special handling for ThrottlerException
    if (exception instanceof ThrottlerException) {
      httpAdapter.reply(
        response,
        {
          success: false,
          message,
          retryAfter: 60,
          timestamp: new Date().toISOString(),
        },
        status,
      );
      return;
    }

    // Mask sensitive fields
    const safeBody = this.safeBody(request?.body);

    // Format message cho log (nếu array thì join)
    const logMessage = Array.isArray(message) ? message.join(', ') : message;

    // Log error without stack trace (too verbose)
    this.logger.error(
      `${request?.method ?? 'UNKNOWN'} ${request?.url ?? ''} -> ${logMessage}`.trim(),
      { body: safeBody },
      HttpExceptionsFilter.name,
    );

    httpAdapter.reply(response, BaseResponse.fail(message), status);
  }

  private normalizeException(exception: unknown): {
    status: number;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { status, message: response };
      }

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
