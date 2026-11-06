import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const value = (req as Record<string, unknown>)[source];
      schema.parse(value);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request input",
            details: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
          },
        });
        return;
      }
      next(error);
    }
  };
