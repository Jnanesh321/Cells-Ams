import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import {
  getDeptMarksForHoD,
  getStudentMarks,
  upsertIAMarks,
} from "../services/marks.service";

const iaSchema = z
  .object({
    subjectId: z.coerce.number().int().positive(),
    section: z.string().trim().min(1),
    iaNumber: z.coerce.number().int().min(1).max(3),
    maxMarks: z.coerce.number().positive().optional().default(30),
    entries: z.array(
      z.object({
        studentProfileId: z.coerce.number().int().positive(),
        marksObtained: z.coerce.number(),
      })
    ),
  })
  .superRefine((value, ctx) => {
    value.entries.forEach((entry, index) => {
      if (entry.marksObtained < 0 || entry.marksObtained > value.maxMarks) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", index, "marksObtained"],
          message: `marksObtained must be between 0 and ${value.maxMarks}`,
        });
      }
    });
  });

export class MarksController {
  static async upsertIA(req: Request, res: Response) {
    try {
      const parsed = iaSchema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }
      if (!req.user) return fail(res, "Unauthorized", 401);

      const result = await upsertIAMarks(
        parsed.data.subjectId,
        parsed.data.iaNumber,
        parsed.data.entries,
        req.user.id,
        parsed.data.maxMarks
      );

      return ok(res, result);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to save IA marks", status);
    }
  }

  static async studentMarks(req: Request, res: Response) {
    try {
      const usn = String(req.params.usn ?? "").trim();
      if (!usn) return fail(res, "USN is required", 400);

      const result = await getStudentMarks(usn);
      return ok(res, result);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to fetch student marks", status);
    }
  }

  static async deptMarks(req: Request, res: Response) {
    try {
      const deptId = Number(req.params.deptId);
      if (!Number.isFinite(deptId)) return fail(res, "Invalid deptId", 400);

      const result = await getDeptMarksForHoD(deptId);
      return ok(res, result);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to fetch department marks", status);
    }
  }
}
