import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

// Attach a requestId to each HTTP request for easier tracing in logs
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // If the client provided an X-Request-Id we keep it, otherwise generate
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && incoming.trim().length > 0
      ? incoming
      : randomUUID();

  (req as unknown as { requestId?: string }).requestId = id;
  try {
    res.setHeader('X-Request-Id', id);
  } catch {
    // ignore if headers already sent
  }

  next();
}
