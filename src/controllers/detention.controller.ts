import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import * as detentionService from "../services/detention.service";

export const DetentionController = {
  async compute(req: Request, res: Response) {
    const department = String(req.params.department ?? "").trim();
    if (!department) return fail(res, "Department code required", 400);

    const result = await detentionService.computeDetention(department);
    return ok(res, result);
  },

  async list(req: Request, res: Response) {
    const department = String(req.params.department ?? "").trim();
    if (!department) return fail(res, "Department code required", 400);

    const exempted = req.query.exempted !== undefined
      ? req.query.exempted === "true"
      : undefined;

    const result = await detentionService.listDetention(department, exempted);
    return ok(res, result);
  },

  async studentStatus(req: Request, res: Response) {
    const usn = String(req.params.usn ?? "").trim();
    if (!usn) return fail(res, "USN required", 400);

    try {
      const result = await detentionService.getStudentDetention(usn);
      return ok(res, result);
    } catch (e: any) {
      return fail(res, e.message ?? "Not found", 404);
    }
  },

  async exempt(req: Request, res: Response) {
    const schema = z.object({
      studentProfileId: z.number().int().positive(),
      reason: z.string().min(1),
      academicYear: z.string().min(1),
      semester: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    if (!req.user) return fail(res, "Unauthorized", 401);

    const result = await detentionService.exemptStudent(
      parsed.data.studentProfileId,
      parsed.data.reason,
      parsed.data.academicYear,
      parsed.data.semester,
      req.user.id
    );
    return ok(res, result);
  },

  async revokeExemption(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return fail(res, "Invalid id", 400);

    const result = await detentionService.revokeExemption(id);
    return ok(res, result);
  },
};
