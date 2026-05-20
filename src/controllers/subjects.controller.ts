import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ok, fail } from "../utils/apiResponse";

export const SubjectsController = {
  async list(req: Request, res: Response) {
    const { department, semester } = req.query;
    const where: Record<string, unknown> = {};

    if (department) {
      const dept = await prisma.department.findUnique({
        where: { code: String(department).toUpperCase() },
        select: { id: true },
      });
      if (!dept) return fail(res, "Department not found", 404);
      where.departmentId = dept.id;
    }
    if (semester) where.semester = String(semester);

    const subjects = await prisma.subject.findMany({
      where,
      select: { id: true, code: true, name: true, semester: true, credits: true },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    });

    return ok(res, subjects);
  },
};
