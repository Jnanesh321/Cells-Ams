import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function requireOwnStudentData(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

  const targetUsn = String(req.params.usn ?? "").trim();
  if (!targetUsn) {
    return res.status(400).json({ success: false, message: "USN is required" });
  }

  const { role, usn, id } = req.user;

  if (role === "STUDENT") {
    if (usn !== targetUsn) {
      return res.status(403).json({ success: false, message: "Forbidden: can only access your own data" });
    }
    return next();
  }

  if (role === "PARENT") {
    const link = await prisma.parentStudent.findFirst({
      where: {
        parentId: id,
        student: { usn: targetUsn },
      },
    });
    if (!link) {
      return res.status(403).json({ success: false, message: "Forbidden: not linked to this student" });
    }
    return next();
  }

  if (["FACULTY", "HOD", "PRINCIPAL", "ADMIN", "ADMISSION_CELL"].includes(role)) {
    return next();
  }

  return res.status(403).json({ success: false, message: "Forbidden" });
}
