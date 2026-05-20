import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../config/prisma";
import { ok } from "../utils/apiResponse";

const router = Router();

router.get(
  "/my-classes",
  auth,
  requireRole("FACULTY"),
  asyncHandler(async (req, res) => {
    const facultyProfile = await prisma.facultyProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!facultyProfile) {
      return res.status(404).json({ success: false, error: "Faculty profile not found" });
    }

    const assignments = await prisma.classAssignment.findMany({
      where: { facultyProfileId: facultyProfile.id, isActive: true },
      include: {
        subject: { select: { id: true, code: true, name: true, semester: true } },
      },
    });

    const section = assignments[0]?.section ?? "";
    const departmentId = req.user!.departmentId;

    const studentCounts = departmentId
      ? await prisma.studentProfile.groupBy({
          by: ["section"],
          where: {
            user: { departmentId, isActive: true, role: "STUDENT" },
            semester: assignments[0]?.subject?.semester ?? undefined,
          },
          _count: { id: true },
        })
      : [];

    const countMap = new Map(studentCounts.map((s) => [s.section, s._count.id]));

    const todayStr = new Date().toISOString().split("T")[0];

    const data = await Promise.all(
      assignments.map(async (a) => {
        const lastAttendance = await prisma.attendanceRecord.findFirst({
          where: {
            subjectId: a.subjectId,
            markedByUserId: req.user!.id,
            date: new Date(todayStr),
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          subjectId: a.subject.id,
          subjectCode: a.subject.code,
          subjectName: a.subject.name,
          section: a.section,
          semester: a.subject.semester,
          enrollmentCount: countMap.get(a.section) ?? 0,
          lastAttendanceDate: lastAttendance?.date?.toISOString() ?? null,
        };
      })
    );

    ok(res, data);
  })
);

export default router;
