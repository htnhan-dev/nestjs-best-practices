import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError, catchError, throwError } from 'rxjs';

import { timeout } from 'rxjs/operators';

/**
 * Guards handlers against hanging requests by enforcing a hard timeout.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs = 5000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }

        return throwError(() => error);
      }),
    );
  }
}
