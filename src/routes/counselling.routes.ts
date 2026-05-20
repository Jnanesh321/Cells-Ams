import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../config/prisma";
import { ok, fail } from "../utils/apiResponse";

const router = Router();

// Faculty: get assigned students for counselling
router.get(
  "/my-students",
  auth,
  requireRole("FACULTY"),
  asyncHandler(async (req, res) => {
    const assignments = await prisma.counsellorAssignment.findMany({
      where: { facultyUserId: req.user!.id, isActive: true },
      include: {
        student: {
          select: { usn: true, name: true, departmentId: true },
        },
        sessions: {
          orderBy: { sessionDate: "desc" },
          take: 1,
          select: { status: true, sessionDate: true, id: true },
        },
        _count: { select: { sessions: true } },
      },
    });

    const data = assignments.map((a) => ({
      assignmentId: a.id,
      studentUserId: a.studentUserId,
      usn: a.student.usn,
      name: a.student.name,
      lastSession: a.sessions[0] ?? null,
      sessionCount: a._count.sessions,
    }));

    ok(res, data);
  })
);

// Faculty/HOD: get counselling sessions for a student
router.get(
  "/student/:studentUserId",
  auth,
  requireRole("FACULTY", "HOD"),
  asyncHandler(async (req, res) => {
    const studentUserId = Number(req.params.studentUserId);
    if (!Number.isFinite(studentUserId)) return fail(res, "Invalid studentUserId", 400);

    const where: any = { studentUserId };
    if (req.user!.role === "FACULTY") {
      where.facultyUserId = req.user!.id;
    }

    const sessions = await prisma.counsellingSession.findMany({
      where,
      orderBy: { sessionDate: "desc" },
      include: {
        assignment: {
          select: {
            faculty: { select: { name: true, usn: true } },
          },
        },
      },
    });

    const student = await prisma.user.findUnique({
      where: { id: studentUserId },
      select: { usn: true, name: true },
    });

    ok(res, { student, sessions });
  })
);

// Faculty: create/update counselling session
router.post(
  "/session",
  auth,
  requireRole("FACULTY"),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      assignmentId: z.number().int().positive(),
      studentUserId: z.number().int().positive(),
      observation: z.string().min(1),
      studentStatus: z.string().min(1),
      guidance: z.string().min(1),
      followUp: z.string().default(""),
      nextSessionDate: z.string().nullable().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());

    const d = parsed.data;
    const session = await prisma.counsellingSession.create({
      data: {
        studentUserId: d.studentUserId,
        facultyUserId: req.user!.id,
        assignmentId: d.assignmentId,
        observation: d.observation,
        studentStatus: d.studentStatus,
        guidance: d.guidance,
        followUp: d.followUp,
        nextSessionDate: d.nextSessionDate ? new Date(d.nextSessionDate) : null,
        status: "COMPLETED",
        sessionDate: new Date(),
      },
    });

    ok(res, session);
  })
);

// HOD: department counselling summary
router.get(
  "/department",
  auth,
  requireRole("HOD"),
  asyncHandler(async (req, res) => {
    const deptId = req.user!.departmentId;
    if (!deptId) return fail(res, "No department", 400);

    const assignments = await prisma.counsellorAssignment.findMany({
      where: {
        departmentId: deptId,
        isActive: true,
      },
      include: {
        faculty: { select: { name: true, usn: true } },
        student: { select: { usn: true, name: true } },
        sessions: {
          orderBy: { sessionDate: "desc" },
          take: 1,
          select: { status: true, sessionDate: true },
        },
        _count: { select: { sessions: true } },
      },
    });

    const totalStudents = assignments.length;
    const completed = assignments.filter(
      (a) => a.sessions[0]?.status === "COMPLETED"
    ).length;
    const overdue = assignments.filter(
      (a) => !a.sessions[0] || a.sessions[0].status === "DUE"
    ).length;

    ok(res, {
      totalAssignments: totalStudents,
      completed,
      overdue,
      pending: totalStudents - completed - overdue,
      assignments: assignments.map((a) => ({
        facultyName: a.faculty.name,
        studentName: a.student.name,
        studentUsn: a.student.usn,
        lastSessionDate: a.sessions[0]?.sessionDate ?? null,
        lastStatus: a.sessions[0]?.status ?? "DUE",
        sessionCount: a._count.sessions,
      })),
    });
  })
);

// HOD: assign faculty to student for counselling
router.post(
  "/assign",
  auth,
  requireRole("HOD"),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      facultyUserId: z.number().int().positive(),
      studentUserId: z.number().int().positive(),
      academicYear: z.string().default("2024-2025"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());

    const deptId = req.user!.departmentId;
    if (!deptId) return fail(res, "No department", 400);

    const assignment = await prisma.counsellorAssignment.upsert({
      where: {
        facultyUserId_studentUserId_academicYear: {
          facultyUserId: parsed.data.facultyUserId,
          studentUserId: parsed.data.studentUserId,
          academicYear: parsed.data.academicYear,
        },
      },
      update: { isActive: true, assignedById: req.user!.id },
      create: {
        facultyUserId: parsed.data.facultyUserId,
        studentUserId: parsed.data.studentUserId,
        departmentId: deptId,
        academicYear: parsed.data.academicYear,
        assignedById: req.user!.id,
      },
      include: {
        faculty: { select: { name: true, usn: true } },
        student: { select: { name: true, usn: true } },
      },
    });

    ok(res, assignment);
  })
);

// Student: get my counselling sessions (read-only)
router.get(
  "/my-sessions",
  auth,
  requireRole("STUDENT"),
  asyncHandler(async (req, res) => {
    const sessions = await prisma.counsellingSession.findMany({
      where: { studentUserId: req.user!.id },
      orderBy: { sessionDate: "desc" },
      include: {
        assignment: {
          select: {
            faculty: { select: { name: true, usn: true } },
          },
        },
      },
    });

    const assignment = await prisma.counsellorAssignment.findFirst({
      where: { studentUserId: req.user!.id, isActive: true },
      select: {
        faculty: { select: { name: true, usn: true } },
      },
    });

    ok(res, { counsellor: assignment?.faculty ?? null, sessions });
  })
);

export default router;
