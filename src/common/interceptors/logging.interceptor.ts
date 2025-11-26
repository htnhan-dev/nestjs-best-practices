import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { AppLoggerService } from '@/common/logger';
import type { Request } from 'express';

/**
 * Logs inbound HTTP requests and their execution time to help trace API behavior.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    if (!request) {
      return next.handle();
    }

    const { method, originalUrl } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        this.logger.log(
          `${method} ${originalUrl} ${duration}ms`,
          LoggingInterceptor.name,
        );
      }),
      catchError((error: unknown) => {
        // const duration = Date.now() - startedAt;
        // const stack = error instanceof Error ? error.stack : undefined;

        // this.logger.error(
        //   `${method} ${originalUrl} failed after ${duration}ms`,
        //   stack,
        //   LoggingInterceptor.name,
        // );

        return throwError(() => error);
      }),
    );
  }
}
