import { winstonConfig } from '@/configs/winston.config';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLoggerService extends ConsoleLogger {
  private logger: winston.Logger;

  constructor() {
    super('AppLogger', { timestamp: true });
    this.logger = winston.createLogger(winstonConfig);
  }

  override log(message: string, context?: string): void {
    const msg = `[${context || 'AppLogger'}] ${message}`;
    this.logger.info(msg);
  }

  override error(message: string, stack?: string, context?: string): void {
    const msg = `[${context || 'AppLogger'}] ${message}`;
    this.logger.error(msg, { stack });
  }

  override warn(message: string, context?: string): void {
    const msg = `[${context || 'AppLogger'}] ${message}`;
    this.logger.warn(msg);
  }

  override debug(message: string, context?: string): void {
    const msg = `[${context || 'AppLogger'}] ${message}`;
    this.logger.debug(msg);
  }

  override verbose(message: string, context?: string): void {
    const msg = `[${context || 'AppLogger'}] ${message}`;
    this.logger.verbose(msg);
  }

  // Dedicated http level for access logs
  http(message: string, context?: string): void {
    const msg = `[${context || 'AppLogger'}] ${message}`;
    // Winston supports the http level by default; fallback to info if not available
    const loggerWithHttp = this.logger as unknown as {
      http?: (msg: string, meta?: Record<string, unknown>) => void;
    };
    if (typeof loggerWithHttp.http === 'function') {
      loggerWithHttp.http(msg);
    } else {
      this.logger.info(msg);
    }
  }
}
