import type { Response } from "express";

/**
 * Consistent API response envelope.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
) => {
  res.status(statusCode).json({
    success: true,
    data,
    error: null,
    meta: meta ?? null,
  });
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: unknown
) => {
  res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message, details: details ?? null },
    meta: null,
  });
};
