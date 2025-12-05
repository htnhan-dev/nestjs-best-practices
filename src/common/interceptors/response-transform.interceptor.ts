import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { BaseResponse } from '@/common/base';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps successful responses into a consistent envelope unless already formatted.
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Already a BaseResponseDto instance
        if (data instanceof BaseResponse) {
          return data;
        }

        // Already has response structure
        if (
          typeof data === 'object' &&
          data !== null &&
          'success' in data &&
          'timestamp' in data
        ) {
          return data;
        }

        // Wrap plain data
        return new BaseResponse({
          success: true,
          data,
        });
      }),
    );
  }
}
