import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export const errors = {
  unauthenticated: () => new ApiError(401, "UNAUTHENTICATED", "Sign in required"),
  forbidden: (msg = "Not allowed") => new ApiError(403, "FORBIDDEN", msg),
  notFound: (msg = "Not found") => new ApiError(404, "NOT_FOUND", msg),
  conflict: (code: string, msg: string) => new ApiError(409, code, msg),
  validation: (msg: string) => new ApiError(422, "VALIDATION", msg),
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(422).json({
      error: { code: "VALIDATION", message: err.issues.map((i) => i.message).join("; ") },
    });
    return;
  }
  console.error("unhandled error", err instanceof Error ? err.message : err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
}
