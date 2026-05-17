import type { Request, Response } from "express";
import { z } from "zod";
import { fail } from "../utils/apiResponse";
import {
  generateClassReportPDF,
  generateStudentReportPDF,
} from "../services/report.service";

const classQuerySchema = z.object({
  deptId: z.coerce.number().int().positive(),
  section: z.string().trim().min(1),
  semester: z.string().trim().min(1),
});

export class ReportController {
  static async studentPdf(req: Request, res: Response) {
    try {
      if (!req.user) return fail(res, "Unauthorized", 401);

      const usn = String(req.params.usn ?? "").trim();
      if (!usn) return fail(res, "USN is required", 400);

      let deptId = req.user.departmentId;
      if (req.user.role === "PRINCIPAL") {
        const queryDept = Number(req.query.deptId);
        if (!Number.isFinite(queryDept)) return fail(res, "deptId is required for principal", 400);
        deptId = queryDept;
      }

      if (!deptId) return fail(res, "Department context not found", 400);

      const buffer = await generateStudentReportPDF(usn, deptId);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="report.pdf"');
      return res.end(buffer);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to generate student report", status);
    }
  }

  static async classPdf(req: Request, res: Response) {
    try {
      if (!req.user) return fail(res, "Unauthorized", 401);

      const parsed = classQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return fail(res, "Validation failed", 400, parsed.error.flatten());
      }

      if (req.user.role === "HOD" && req.user.departmentId !== parsed.data.deptId) {
        return fail(res, "Forbidden department access", 403);
      }

      const buffer = await generateClassReportPDF(
        parsed.data.deptId,
        parsed.data.section,
        parsed.data.semester
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="report.pdf"');
      return res.end(buffer);
    } catch (error: any) {
      const status = typeof error?.status === "number" ? error.status : 500;
      return fail(res, error?.message ?? "Failed to generate class report", status);
    }
  }
}
