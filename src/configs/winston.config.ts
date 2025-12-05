import * as winston from 'winston';

import { mkdirSync } from 'fs';
import { hostname } from 'os';
import { join } from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const logsDir = join(process.cwd(), 'logs');

// Tạo folder logs nếu chưa tồn tại
try {
  mkdirSync(logsDir, { recursive: true });
} catch (err) {
  console.error('Failed to create logs directory:', err);
}

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
  endpoint: '1;35',
  method: '1;32',
  reqId: '90',
  timestamp: '89',
};

export const formatLog = (info: winston.Logform.TransformableInfo) => {
  const timestamp = String(info.timestamp);
  const rawLevel = String(info.level);
  const isColorized = ansiEscapeRegex.test(rawLevel);
  const levelKey = (isColorized ? stripAnsi(rawLevel) : rawLevel).toLowerCase();
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
    // Fallback: look for METHOD + path pattern e.g. GET /api/categories 30ms
    if (!endpointMatch) {
      const fallbackMatch = message.match(
        /\b(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+(\/[^\s,}]+)(?:\s|$)/i,
      );
      if (fallbackMatch) {
        const methodToken = fallbackMatch[1];
        const pathToken = fallbackMatch[2];
        const coloredMethod = wrapAnsi(methodToken, consoleColors.method);
        const coloredPath = wrapAnsi(pathToken, consoleColors.endpoint);
        message = message.replace(
          `${methodToken} ${pathToken}`,
          `${coloredMethod} ${coloredPath}`,
        );
      }
    }
    // Highlight error message detail
    const arrowIndex = message.indexOf('-> ');
    if (arrowIndex !== -1) {
      let errText = message.slice(arrowIndex + 3);
      const reqIndex = errText.indexOf(' [req:');
      if (reqIndex !== -1) errText = errText.slice(0, reqIndex);
      errText = errText.trim();
      if (errText) {
        const coloredError = wrapAnsi(errText, '1;31');
        message = message.replace(errText, coloredError);
      }
    }
  }

  // colorize timestamp and remove request-id from console output
  let ts = timestamp;
  if (isColorized) ts = wrapAnsi(timestamp, consoleColors.timestamp);

  if (isColorized) {
    // strip any request id tags (e.g. [req:...]) from console logs
    message = message.replace(/\s?\[req:[^\]]+\]/g, '');
  }

  let log = `${ts} [${displayLevel}]: ${message}`;

  if (stackStr) {
    if (isColorized && levelKey === 'error') {
      // Show only the first non-empty line of the stack to keep console clean
      const lines = String(stackStr).split('\n');
      const firstLine = lines.find((l) => l.trim().length > 0) ?? '';
      if (firstLine) log += `\n${wrapAnsi(firstLine, '31')}`;
    } else {
      log += `\n${stackStr}`;
    }
  }
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

const defaultLogLevel =
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === 'production' ? 'info' : 'http');

export const winstonConfig: winston.LoggerOptions = {
  level: defaultLogLevel,
  format: customFormat,
  defaultMeta: {
    service: 'unified-crm-api',
    pid: process.pid,
    hostname: hostname(),
    env: process.env.NODE_ENV ?? 'development',
  },
  transports: [
    new winston.transports.Console({
      level: process.env.CONSOLE_LOG_LEVEL ?? defaultLogLevel,
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
