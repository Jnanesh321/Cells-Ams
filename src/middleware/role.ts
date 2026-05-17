import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
    }

    if (!roles.includes(req.user.role)) {
      return next(Object.assign(new Error("Forbidden"), { status: 403 }));
    }

    next();
  };
}
