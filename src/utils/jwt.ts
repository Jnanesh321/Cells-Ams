import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  userId: number;
  role: string;
  departmentId: number | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: (env.JWT_ACCESS_EXPIRES_IN || "15m") as string & jwt.SignOptions["expiresIn"],
  });
}

const REFRESH_SECRET = env.JWT_REFRESH_SECRET || env.JWT_ACCESS_SECRET;

export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string & jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: number } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: number };
}