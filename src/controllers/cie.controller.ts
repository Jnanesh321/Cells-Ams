import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import * as cieService from "../services/cie.service";

export const CIEController = {
  async upsertAssignment(req: Request, res: Response) {
    const schema = z.object({
      studentProfileId: z.number().int().positive(),
      subjectId: z.number().int().positive(),
      assignmentNumber: z.number().int().positive(),
      marksObtained: z.number().min(0),
      maxMarks: z.number().positive().default(10),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    if (!req.user) return fail(res, "Unauthorized", 401);

    const result = await cieService.upsertAssignment(
      parsed.data.studentProfileId,
      parsed.data.subjectId,
      parsed.data.assignmentNumber,
      parsed.data.marksObtained,
      parsed.data.maxMarks,
      req.user.id
    );
    return ok(res, result);
  },

  async getSubjectAssignmentMarks(req: Request, res: Response) {
    const subjectId = Number(req.params.subjectId);
    const section = String(req.params.section ?? "");
    if (!Number.isFinite(subjectId) || !section) {
      return fail(res, "Invalid subjectId or section", 400);
    }
    const result = await cieService.getSubjectAssignmentMarks(subjectId, section);
    return ok(res, result);
  },

  async computeCIE(req: Request, res: Response) {
    const subjectId = Number(req.params.subjectId);
    if (!Number.isFinite(subjectId)) return fail(res, "Invalid subjectId", 400);

    const result = await cieService.computeCIE(subjectId);
    return ok(res, result);
  },

  async getStudentCIE(req: Request, res: Response) {
    const usn = String(req.params.usn ?? "").trim();
    if (!usn) return fail(res, "USN required", 400);

    try {
      const result = await cieService.getStudentCIE(usn);
      return ok(res, result);
    } catch (e: any) {
      return fail(res, e.message ?? "Not found", 404);
    }
  },

  async getSubjectCIE(req: Request, res: Response) {
    const subjectId = Number(req.params.subjectId);
    if (!Number.isFinite(subjectId)) return fail(res, "Invalid subjectId", 400);

    try {
      const result = await cieService.getSubjectCIE(subjectId);
      return ok(res, result);
    } catch (e: any) {
      return fail(res, e.message ?? "Not found", 404);
    }
  },

  async finalizeCIE(req: Request, res: Response) {
    const subjectId = Number(req.params.subjectId);
    if (!Number.isFinite(subjectId)) return fail(res, "Invalid subjectId", 400);
    if (!req.user) return fail(res, "Unauthorized", 401);

    const result = await cieService.finalizeCIE(subjectId, req.user.id);
    return ok(res, result);
  },
};
