import * as winston from 'winston';

import DailyRotateFile from 'winston-daily-rotate-file';
import { hostname } from 'os';
import { join } from 'path';
import { mkdirSync } from 'fs';

const logsDir = join(process.cwd(), 'logs');

// Tạo folder logs nếu chưa tồn tại
try {
  mkdirSync(logsDir, { recursive: true });
} catch (err) {
  console.error('Failed to create logs directory:', err);
}

// Icons and colors mapping for levels
const levelEmoji: Record<string, string> = {
  error: '🔴',
  warn: '⚠️',
  info: 'ℹ️',
  http: '🌐',
  debug: '�',
  verbose: '🔎',
  silly: '🤪',
};

// Define colors for levels (used by colorize())
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'bold cyan',
  http: 'magenta',
  debug: 'cyan',
  verbose: 'green',
  silly: 'gray',
});

// Helper to strip ANSI color codes
const ESC = String.fromCharCode(27);
const ansiEscapeRegex = new RegExp(ESC + '\\[[0-9;]*m', 'g');
const stripAnsi = (str = ''): string =>
  String(str).replace(ansiEscapeRegex, '');

// Helper to wrap text in ANSI color codes
const wrapAnsi = (text: string, colorCode: string) =>
  `${ESC}[${colorCode}m${text}${ESC}[0m`;

// Console color codes to use for different parts
const consoleColors: Record<string, string> = {
  context: '1;32',
  endpoint: '1;34',
  method: '1;35',
};

export const formatLog = (info: winston.Logform.TransformableInfo) => {
  const timestamp = String(info.timestamp);
  const rawLevel = String(info.level);
  const isColorized = ansiEscapeRegex.test(rawLevel);
  const levelKey = (isColorized ? stripAnsi(rawLevel) : rawLevel).toLowerCase();
  const emoji = levelEmoji[levelKey] ?? 'ℹ️';
  const displayLevel = isColorized ? rawLevel : levelKey.toUpperCase();

  let message = '';
  if (info.message == null) {
    message = '';
  } else if (typeof info.message === 'object') {
    message = JSON.stringify(info.message, null, 2);
  } else {
    message = String(info.message as unknown);
  }

  const stackVal = (info as Record<string, unknown>).stack;
  const stackStr = stackVal
    ? typeof stackVal === 'string'
      ? String(stackVal)
      : JSON.stringify(stackVal, null, 2)
    : '';

  // If colorized console, highlight context and endpoint separately
  if (isColorized && typeof message === 'string') {
    // Highlight the first bracketed context e.g. [RouterExplorer]
    const contextMatch = message.match(/^(\[[^\]]+\])/);
    if (contextMatch) {
      const ctx = contextMatch[1];
      const coloredCtx = wrapAnsi(ctx, consoleColors.context);
      message = message.replace(ctx, coloredCtx);
    }

    // Highlight the endpoint pattern e.g. {/api/brands/:id, PATCH}
    const endpointMatch = message.match(/(\{\/[^}]+\})/);
    if (endpointMatch) {
      const ep = endpointMatch[1];
      // Optional: color the method inside endpoint differently
      const innerMatch = ep.match(/\{([^,]+),\s*([^}]+)\}/);
      if (innerMatch) {
        const [, path, method] = innerMatch;
        const coloredMethod = wrapAnsi(method, consoleColors.method);
        const coloredEndpoint = wrapAnsi(
          `{${path}, ${coloredMethod}}`,
          consoleColors.endpoint,
        );
        message = message.replace(ep, coloredEndpoint);
      } else {
        const coloredEndpoint = wrapAnsi(ep, consoleColors.endpoint);
        message = message.replace(ep, coloredEndpoint);
      }
    }
  }

  let log = `${timestamp} ${emoji}  - [${displayLevel}]: ${message}`;
  if (stackStr) log += `\n${stackStr}`;
  return log;
};

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(formatLog),
);

const dailyRotateFileTransport = new DailyRotateFile({
  filename: join(logsDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
  format: customFormat,
});

const errorDailyRotateFileTransport = new DailyRotateFile({
  filename: join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  zippedArchive: true,
  format: customFormat,
});

// Access logs (HTTP) - useful to separate access logs from application logs
const accessDailyRotateFileTransport = new DailyRotateFile({
  filename: join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'http',
  zippedArchive: true,
  format: customFormat,
});

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'unified-crm-api',
    pid: process.pid,
    hostname: hostname(),
    env: process.env.NODE_ENV ?? 'development',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(formatLog),
      ),
    }),
    dailyRotateFileTransport,
    errorDailyRotateFileTransport,
    accessDailyRotateFileTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
      format: customFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
      format: customFormat,
    }),
  ],
};
