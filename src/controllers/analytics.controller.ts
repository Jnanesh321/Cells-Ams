import type { Request, Response } from "express";
import { fail, ok } from "../utils/apiResponse";
import { getCollegeAnalytics } from "../services/analytics.service";

export class AnalyticsController {
  static async college(req: Request, res: Response) {
    try {
      if (!req.user) {
        return fail(res, "Unauthorized", 401);
      }

      const rows = await getCollegeAnalytics();
      return ok(res, rows);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to load college analytics", status);
    }
  }
}