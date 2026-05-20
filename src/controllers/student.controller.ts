import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import * as studentService from "../services/student.service";

export const StudentController = {
  async getProfile(req: Request, res: Response) {
    const usn = String(req.params.usn ?? "").trim();
    if (!usn) return fail(res, "USN required", 400);

    try {
      const profile = await studentService.getFullProfile(usn);
      return ok(res, profile);
    } catch (e: any) {
      return fail(res, e.message ?? "Not found", 404);
    }
  },

  async updateProfile(req: Request, res: Response) {
    if (!req.user) return fail(res, "Unauthorized", 401);

    const schema = z.object({
      studentPhone: z.string().optional(),
      currentAddress: z.string().optional(),
      permanentAddress: z.string().optional(),
      bloodGroup: z.string().optional(),
      hobbies: z.string().optional(),
      achievements: z.string().optional(),
      photoUrl: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());

    const result = await studentService.updateProfile(req.user.id, parsed.data);
    return ok(res, result);
  },
};
