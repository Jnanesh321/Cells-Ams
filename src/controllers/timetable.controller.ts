import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import {
  createTimetableEntry,
  bulkCreateTimetable,
  getTimetableForDay,
  getFullWeekTimetable,
  getFacultyTimetable,
  removeTimetableEntry,
  updateTimetableEntry,
  getAllPeriods,
  createPeriod,
  deletePeriod,
} from "../services/timetable.service";

export class TimetableController {
  static async getDay(req: Request, res: Response) {
    try {
      const schema = z.object({
        dayNumber: z.coerce.number().int().min(1).max(6),
        section: z.string().trim().min(1),
        academicYear: z.string().optional(),
      });

      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const entries = await getTimetableForDay(
        parsed.data.dayNumber,
        parsed.data.section,
        parsed.data.academicYear
      );
      return ok(res, entries);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to fetch timetable", 500);
    }
  }

  static async getWeek(req: Request, res: Response) {
    try {
      const section = req.query.section as string;
      if (!section) return fail(res, "Section is required", 400);

      const academicYear = req.query.academicYear as string | undefined;
      const timetable = await getFullWeekTimetable(section, academicYear);
      return ok(res, timetable);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to fetch weekly timetable", 500);
    }
  }

  static async getFacultyTimetable(req: Request, res: Response) {
    try {
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const slots = await getFacultyTimetable(id);
      return ok(res, slots);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to fetch faculty timetable", 500);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const schema = z.object({
        dayNumber: z.number().int().min(1).max(6),
        periodId: z.number().int().positive(),
        subjectId: z.number().int().positive(),
        section: z.string().trim().min(1),
        semester: z.string().trim().min(1),
        academicYear: z.string().trim().min(1),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const entry = await createTimetableEntry(parsed.data);
      return ok(res, entry, 201);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to create entry", 500);
    }
  }

  static async bulkCreate(req: Request, res: Response) {
    try {
      const schema = z.object({
        entries: z.array(
          z.object({
            dayNumber: z.number().int().min(1).max(6),
            periodId: z.number().int().positive(),
            subjectId: z.number().int().positive(),
            section: z.string().trim().min(1),
            semester: z.string().trim().min(1),
            academicYear: z.string().trim().min(1),
          })
        ),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const result = await bulkCreateTimetable(parsed.data.entries);
      return ok(res, result, 201);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to bulk create timetable", 500);
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const id = z.coerce.number().int().positive().parse(req.params.id);
      await removeTimetableEntry(id);
      return ok(res, { message: "Entry removed" });
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to remove entry", 500);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const schema = z.object({
        dayNumber: z.number().int().min(1).max(6).optional(),
        periodId: z.number().int().positive().optional(),
        subjectId: z.number().int().positive().optional(),
        section: z.string().trim().min(1).optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const entry = await updateTimetableEntry(id, parsed.data);
      return ok(res, entry);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to update entry", 500);
    }
  }

  static async listPeriods(req: Request, res: Response) {
    try {
      const periods = await getAllPeriods();
      return ok(res, periods);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to list periods", 500);
    }
  }

  static async createPeriod(req: Request, res: Response) {
    try {
      const schema = z.object({
        name: z.string().trim().min(1),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        type: z.enum(["lecture", "lab"]).default("lecture"),
        order: z.number().int().positive(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      const period = await createPeriod(parsed.data);
      return ok(res, period, 201);
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to create period", 500);
    }
  }

  static async removePeriod(req: Request, res: Response) {
    try {
      const id = z.coerce.number().int().positive().parse(req.params.id);
      await deletePeriod(id);
      return ok(res, { message: "Period deleted" });
    } catch (error: any) {
      return fail(res, error?.message ?? "Failed to delete period", 500);
    }
  }
}
