import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import {
  getAcademicDayForDate,
  setAcademicDayOverride,
  getOverrides,
  advanceAcademicDay,
  getTodayScheduleForSection,
  getFacultyDaySchedule,
} from "../services/academicDay.service";
import { getStudentAttendanceSession } from "../services/attendance.service";

export class AcademicDayController {
  static async current(req: Request, res: Response) {
    try {
      const date = req.query.date ? new Date(String(req.query.date)) : new Date();
      const dayInfo = await getAcademicDayForDate(date);
      return ok(res, dayInfo);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to get academic day", 500);
    }
  }

  static async advance(req: Request, res: Response) {
    try {
      const result = await advanceAcademicDay();
      return ok(res, result);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to advance day", 500);
    }
  }

  static async setOverride(req: Request, res: Response) {
    try {
      const schema = z.object({
        date: z.coerce.date(),
        dayType: z.enum(["holiday", "exam", "suspended", "event", "working"]),
        title: z.string().optional(),
        departmentId: z.coerce.number().int().positive().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const result = await setAcademicDayOverride(
        parsed.data.date,
        parsed.data.dayType,
        parsed.data.title,
        parsed.data.departmentId
      );
      return ok(res, result);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to set override", 500);
    }
  }

  static async listOverrides(req: Request, res: Response) {
    try {
      const from = req.query.from ? new Date(String(req.query.from)) : undefined;
      const to = req.query.to ? new Date(String(req.query.to)) : undefined;
      const overrides = await getOverrides(from, to);
      return ok(res, overrides);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to list overrides", 500);
    }
  }

  static async todaySchedule(req: Request, res: Response) {
    try {
      if (!req.user) return fail(res, "Unauthorized", 401);

      if (req.user.role === "FACULTY" || req.user.role === "HOD") {
        const facultyProfile = await import("../config/prisma").then(({ prisma }) =>
          prisma.facultyProfile.findUnique({ where: { userId: req.user!.id } })
        );
        if (!facultyProfile) return fail(res, "Faculty profile not found", 404);

        const schedule = await getFacultyDaySchedule(facultyProfile.id);
        return ok(res, schedule);
      }

      const section = req.query.section as string;
      if (!section && req.user.section) {
        const schedule = await getTodayScheduleForSection(req.user.section);
        return ok(res, schedule);
      }

      if (!section) return fail(res, "Section is required", 400);
      const schedule = await getTodayScheduleForSection(section);
      return ok(res, schedule);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to get schedule", 500);
    }
  }

  static async todayAttendanceSession(req: Request, res: Response) {
    try {
      if (!req.user) return fail(res, "Unauthorized", 401);
      if (req.user.role !== "FACULTY") return fail(res, "Faculty only", 403);

      const facultyProfile = await import("../config/prisma").then(({ prisma }) =>
        prisma.facultyProfile.findUnique({ where: { userId: req.user!.id } })
      );
      if (!facultyProfile) return fail(res, "Faculty profile not found", 404);

      const schedule = await getFacultyDaySchedule(facultyProfile.id);
      if (!schedule.dayInfo.isWorking || schedule.periods.length === 0) {
        return ok(res, { dayInfo: schedule.dayInfo, sessions: [] });
      }

      const sessions = [];
      for (const period of schedule.periods) {
        const session = await getStudentAttendanceSession(
          period.id,
          period.section,
          schedule.dayInfo.date
        );
        sessions.push({ period, session });
      }

      return ok(res, { dayInfo: schedule.dayInfo, sessions });
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to get attendance sessions", 500);
    }
  }
}
