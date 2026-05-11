import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { verifyAccessToken } from "../utils/jwt";

export type AuthUser = {
  id: number;
  usn: string;
  name: string;
  email: string | null;
  role: import("@prisma/client").Role;
  isActive: boolean;
  departmentId: number | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function auth(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

  const payload = verifyAccessToken(token);
  const userId = Number(payload.sub);
  if (!Number.isFinite(userId)) {
    return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      usn: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      departmentId: true,
    },
  });

  if (!user || !user.isActive) {
    return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }

  req.user = user;
  next();
}

