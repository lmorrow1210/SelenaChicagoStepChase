import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE, verifySession } from "../lib/session.js";
import { errors } from "./errors.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE];
  const claims = token ? verifySession(token) : null;
  if (!claims) return next(errors.unauthenticated());
  req.userId = claims.user_id;
  next();
}
