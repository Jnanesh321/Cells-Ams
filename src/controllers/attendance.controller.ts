import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import {
  getAttendanceSession,
  getStudentAttendanceSummary,
  markBulkAttendance,
  updateAttendanceRecord,
} from "../services/attendance.service";

const markSchema = z.object({
  subjectId: z.coerce.number().int().positive(),
  section: z.string().trim().min(1),
  date: z.coerce.date(),
  records: z.array(
    z.object({
      studentProfileId: z.coerce.number().int().positive(),
      status: z.enum(["PRESENT", "ABSENT", "OD"]),
    })
  ),
});

const updateSchema = z.object({
  studentProfileId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  section: z.string().trim().min(1),
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "OD"]),
  reason: z.string().trim().min(1),
});

const sessionQuerySchema = z.object({
  subjectId: z.coerce.number().int().positive(),
  section: z.string().trim().min(1),
  date: z.coerce.date(),
  iaNumber: z.coerce.number().int().min(1).max(3).optional(),
});

export class AttendanceController {
  static async mark(req: Request, res: Response) {
    try {
      const parsed = markSchema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }
      if (!req.user) return fail(res, "Unauthorized", 401);

      const result = await markBulkAttendance(
        parsed.data.subjectId,
        parsed.data.section,
        parsed.data.date,
        parsed.data.records,
        req.user.id
      );

      return ok(res, result, 201);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to mark attendance", status);
    }
  }

  static async updateRecord(req: Request, res: Response) {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }
      if (!req.user) return fail(res, "Unauthorized", 401);

      const result = await updateAttendanceRecord(
        parsed.data.studentProfileId,
        parsed.data.subjectId,
        parsed.data.date,
        parsed.data.status,
        req.user.id,
        parsed.data.reason
      );

      return ok(res, result);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to update attendance", status);
    }
  }

  static async summary(req: Request, res: Response) {
    try {
      const usn = String(req.params.usn ?? "").trim();
      if (!usn) return fail(res, "USN is required", 400);

      const result = await getStudentAttendanceSummary(usn);
      return ok(res, result);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to fetch summary", status);
    }
  }

  static async session(req: Request, res: Response) {
    try {
      const parsed = sessionQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const data = await getAttendanceSession(
        parsed.data.subjectId,
        parsed.data.section,
        parsed.data.date,
        parsed.data.iaNumber
      );

      return ok(res, data);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to fetch attendance session", status);
    }
  }
}
