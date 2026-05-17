import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import { getNotices, createNotice } from "../services/notice.service";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  targetRole: z.string().optional().nullable(),
  departmentId: z.coerce.number().int().positive().optional().nullable(),
});

export class NoticeController {
  static async list(req: Request, res: Response) {
    try {
      const role = req.user?.role ?? null;
      const deptId = req.user?.departmentId ?? undefined;
      const notices = await getNotices(role, deptId);
      return ok(res, notices);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to fetch notices", status);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) return fail(res, "Unauthorized", 401);

      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const notice = await createNotice({
        ...parsed.data,
        postedByUserId: req.user.id,
      });

      return ok(res, notice, 201);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to create notice", status);
    }
  }
}
