import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import {
  assignFacultyToClass,
  listAllAssignments,
  removeAssignment,
} from "../services/admin.service";

const assignSchema = z.object({
  facultyUserId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  section: z.string().trim().min(1),
  semester: z.string().trim().min(1),
  academicYear: z.string().trim().min(1),
});

export class AdminController {
  static async assignClass(req: Request, res: Response) {
    try {
      const parsed = assignSchema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      if (!req.user) return fail(res, "Unauthorized", 401);

      const assignment = await assignFacultyToClass({
        ...parsed.data,
        assignedByUserId: req.user.id,
      });

      return ok(res, assignment, 201);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to assign class", status);
    }
  }

  static async removeAssignment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return fail(res, "Invalid assignment id", 400);
      }

      const removed = await removeAssignment(id);
      return ok(res, removed);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to remove assignment", status);
    }
  }

  static async listAssignments(req: Request, res: Response) {
    try {
      const deptIdRaw = req.query.deptId;
      const deptId = typeof deptIdRaw === "string" ? Number(deptIdRaw) : undefined;

      const rows = await listAllAssignments(
        Number.isFinite(deptId as number) ? (deptId as number) : undefined
      );

      return ok(res, rows);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to list assignments", status);
    }
  }
}
