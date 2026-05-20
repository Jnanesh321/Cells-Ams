import type { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import * as iaService from "../services/ia.service";

const idParam = z.object({ id: z.coerce.number().int().positive() });
const paperIdParam = z.object({ paperId: z.coerce.number().int().positive() });
const subjectIdParam = z.object({ subjectId: z.coerce.number().int().positive() });

// ── Question Paper ──

const createPaperSchema = z.object({
  subjectId: z.number().int().positive(),
  iaNumber: z.number().int().min(1).max(3),
  semester: z.string().min(1),
  section: z.string().min(1),
  academicYear: z.string().min(1),
  totalMarks: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
});

export const IAController = {
  async createQuestionPaper(req: Request, res: Response) {
    const parsed = createPaperSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const paper = await iaService.createQuestionPaper({
      ...parsed.data,
      createdByUserId: req.user!.id,
    });
    return ok(res, paper, 201);
  },

  async listQuestionPapers(req: Request, res: Response) {
    const { subjectId, iaNumber, section, academicYear } = req.query;
    const papers = await iaService.listQuestionPapers({
      subjectId: subjectId ? Number(subjectId) : undefined,
      iaNumber: iaNumber ? Number(iaNumber) : undefined,
      section: section as string | undefined,
      academicYear: academicYear as string | undefined,
    });
    return ok(res, papers);
  },

  async getQuestionPaper(req: Request, res: Response) {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) return fail(res, "Invalid id", 400);
    const paper = await iaService.getQuestionPaper(parsed.data.id);
    if (!paper) return fail(res, "Not found", 404);
    return ok(res, paper);
  },

  async updateQuestionPaper(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const schema = z.object({
      totalMarks: z.number().positive().optional(),
      duration: z.number().int().positive().optional(),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const paper = await iaService.updateQuestionPaper(id, parsed.data);
    return ok(res, paper);
  },

  // ── Questions & Sub-questions ──

  async addQuestions(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const schema = z.object({
      questions: z.array(
        z.object({
          questionNumber: z.number().int().min(1).max(4),
          text: z.string().optional(),
          maxMarks: z.number().positive().optional(),
          subQuestions: z.array(
            z.object({
              label: z.enum(["a", "b", "c", "d"]),
              maxMarks: z.number().positive().optional(),
              text: z.string().optional(),
            })
          ).min(1),
        })
      ).min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const result = await iaService.addQuestions(id, parsed.data.questions);
    return ok(res, result, 201);
  },

  async updateQuestion(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const schema = z.object({
      text: z.string().optional(),
      maxMarks: z.number().positive().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const result = await iaService.updateQuestion(id, parsed.data);
    return ok(res, result);
  },

  async deleteQuestion(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    await iaService.deleteQuestion(id);
    return ok(res, { deleted: true });
  },

  async addSubQuestions(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const schema = z.object({
      subQuestions: z.array(
        z.object({
          label: z.enum(["a", "b", "c", "d"]),
          maxMarks: z.number().positive().optional(),
          text: z.string().optional(),
        })
      ).min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const result = await iaService.addSubQuestions(id, parsed.data.subQuestions);
    return ok(res, result, 201);
  },

  // ── Marks ──

  async getMarks(req: Request, res: Response) {
    const parsed = paperIdParam.safeParse(req.params);
    if (!parsed.success) return fail(res, "Invalid paperId", 400);
    const data = await iaService.getMarksSpreadsheet(parsed.data.paperId);
    if (!data) return fail(res, "Paper not found", 404);
    return ok(res, data);
  },

  async upsertMarks(req: Request, res: Response) {
    const { paperId } = paperIdParam.parse(req.params);
    const schema = z.object({
      entries: z.array(
        z.object({
          studentProfileId: z.number().int().positive(),
          subQuestionId: z.number().int().positive(),
          marksObtained: z.number().min(0),
        })
      ).min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());

    // Absentee check — prevent marking marks for absent students
    const paper = await iaService.getQuestionPaper(paperId);
    if (!paper) return fail(res, "Paper not found", 404);

    const absentees = await import("../services/ia.service").then((m) =>
      m.getAbsentees(paperId)
    );
    if (absentees) {
      const absentIds = new Set(
        absentees.students.filter((s) => s.isAbsent).map((s) => s.studentProfileId)
      );
      for (const entry of parsed.data.entries) {
        if (absentIds.has(entry.studentProfileId)) {
          return fail(res, `Student ${entry.studentProfileId} is marked absent`, 403);
        }
      }
    }

    const result = await iaService.upsertMarks(paperId, parsed.data.entries, req.user!.id);
    return ok(res, result);
  },

  // ── Absentees ──

  async getAbsentees(req: Request, res: Response) {
    const parsed = paperIdParam.safeParse(req.params);
    if (!parsed.success) return fail(res, "Invalid paperId", 400);
    const data = await iaService.getAbsentees(parsed.data.paperId);
    if (!data) return fail(res, "Paper not found", 404);
    return ok(res, data);
  },

  async markAbsentees(req: Request, res: Response) {
    const { paperId } = paperIdParam.parse(req.params);
    const schema = z.object({
      studentProfileIds: z.array(z.number().int().positive()).min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const result = await iaService.markAbsentees(paperId, parsed.data.studentProfileIds, req.user!.id);
    return ok(res, result);
  },

  async unmarkAbsentees(req: Request, res: Response) {
    const { paperId } = paperIdParam.parse(req.params);
    const schema = z.object({
      studentProfileIds: z.array(z.number().int().positive()).min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const result = await iaService.unmarkAbsentees(paperId, parsed.data.studentProfileIds);
    return ok(res, result);
  },

  // ── Lab ──

  async getLabConfig(req: Request, res: Response) {
    const { subjectId } = subjectIdParam.parse(req.params);
    const config = await iaService.getLabConfig(subjectId);
    return ok(res, config);
  },

  async upsertLabConfig(req: Request, res: Response) {
    const { subjectId } = subjectIdParam.parse(req.params);
    const schema = z.object({
      components: z.array(
        z.object({
          component: z.string().min(1),
          maxMarks: z.number().positive(),
          isExternal: z.boolean().optional(),
        })
      ).min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const result = await iaService.upsertLabConfig(subjectId, parsed.data.components, req.user!.id);
    return ok(res, result);
  },

  async getLabMarks(req: Request, res: Response) {
    const { subjectId } = subjectIdParam.parse(req.params);
    const data = await iaService.getLabMarks(subjectId);
    return ok(res, data);
  },

  async upsertLabMarks(req: Request, res: Response) {
    const { subjectId } = subjectIdParam.parse(req.params);
    const schema = z.object({
      entries: z.array(
        z.object({
          studentProfileId: z.number().int().positive(),
          component: z.string().min(1),
          marksObtained: z.number().min(0),
          maxMarks: z.number().positive(),
        })
      ).min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const result = await iaService.upsertLabMarks(subjectId, parsed.data.entries, req.user!.id);
    return ok(res, result);
  },

  // ── Results ──

  async getResult(req: Request, res: Response) {
    const parsed = paperIdParam.safeParse(req.params);
    if (!parsed.success) return fail(res, "Invalid paperId", 400);
    const data = await iaService.getResult(parsed.data.paperId);
    if (!data) return fail(res, "Paper not found", 404);
    return ok(res, data);
  },

  // ── Student View ──

  async getMyMarks(req: Request, res: Response) {
    const { subjectId } = subjectIdParam.parse(req.params);
    const userId = req.user!.id;
    const profile = await import("../config/prisma").then((p) =>
      p.prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } })
    );
    if (!profile) return fail(res, "Student profile not found", 404);
    const results = await iaService.getMyMarks(profile.id, subjectId);
    return ok(res, results);
  },
};
