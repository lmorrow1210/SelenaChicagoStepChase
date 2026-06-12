import jwt from "jsonwebtoken";
import type { Response } from "express";

const COOKIE = "sc_session";
const SEVEN_DAYS_S = 7 * 24 * 60 * 60;

export interface SessionClaims {
  user_id: string;
}

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is required");
  return s;
}

export function signSession(claims: SessionClaims): string {
  return jwt.sign(claims, secret(), { expiresIn: SEVEN_DAYS_S });
}

export function verifySession(token: string): SessionClaims | null {
  try {
    const payload = jwt.verify(token, secret());
    if (typeof payload === "object" && typeof payload.user_id === "string") {
      return { user_id: payload.user_id };
    }
    return null;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, claims: SessionClaims): void {
  res.cookie(COOKIE, signSession(claims), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SEVEN_DAYS_S * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE, { path: "/" });
}

export const SESSION_COOKIE = COOKIE;
