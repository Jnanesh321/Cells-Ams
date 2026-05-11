import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "@prisma/client";

export type AccessTokenPayload = {
  sub: string; // userId
  role: Role;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as jwt.Secret, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded !== "object" || decoded === null) {
    throw Object.assign(new Error("Invalid token payload"), { status: 401 });
  }

  const { sub, role } = decoded as Partial<AccessTokenPayload>;
  if (!sub || !role) {
    throw Object.assign(new Error("Invalid token payload"), { status: 401 });
  }

  return { sub, role } as AccessTokenPayload;
}

