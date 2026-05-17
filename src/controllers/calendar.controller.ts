import type { Request, Response } from "express";
import { ok, fail } from "../utils/apiResponse";
import { getCalendarEvents } from "../services/calendar.service";

export class CalendarController {
  static async list(req: Request, res: Response) {
    try {
      const type = typeof req.query.type === "string" ? req.query.type : undefined;
      const events = await getCalendarEvents(type);
      return ok(res, events);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to fetch calendar events", status);
    }
  }
}
