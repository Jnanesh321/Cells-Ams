import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import {
  getTodaysBirthdays,
  setBirthdayVisibility,
  getBirthdayVisibility,
} from "../services/birthday.service";

export class BirthdayController {
  static async today(req: Request, res: Response) {
    try {
      const birthdays = await getTodaysBirthdays();
      return ok(res, birthdays);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to fetch birthdays", 500);
    }
  }

  static async getVisibility(req: Request, res: Response) {
    try {
      if (!req.user) return fail(res, "Unauthorized", 401);
      const visible = await getBirthdayVisibility(req.user.id);
      return ok(res, { visible });
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to get visibility", 500);
    }
  }

  static async updateVisibility(req: Request, res: Response) {
    try {
      if (!req.user) return fail(res, "Unauthorized", 401);

      const schema = z.object({
        visible: z.boolean(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      await setBirthdayVisibility(req.user.id, parsed.data.visible);
      return ok(res, { visible: parsed.data.visible });
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to update visibility", 500);
    }
  }
}
