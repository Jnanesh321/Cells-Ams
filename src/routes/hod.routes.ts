import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../config/prisma";
import { ok } from "../utils/apiResponse";

const router = Router();

router.get(
  "/department-summary",
  auth,
  requireRole("HOD"),
  asyncHandler(async (req, res) => {
    const deptId = req.user!.departmentId;
    if (!deptId) {
      return res.status(400).json({ success: false, error: "HOD has no department" });
    }

    // Student count
    const studentCount = await prisma.user.count({
      where: { departmentId: deptId, role: "STUDENT", isActive: true },
    });

    // Faculty count + workload
    const facultyProfiles = await prisma.facultyProfile.findMany({
      where: { user: { departmentId: deptId, isActive: true } },
      include: {
        user: { select: { name: true, usn: true } },
        classAssignments: {
          where: { isActive: true },
          select: { subjectId: true, section: true },
        },
      },
    });

    // Faculty workload: count sections per subject for each faculty
    const facultyWorkload = facultyProfiles.map((fp) => {
      const subjectCodes = new Set(fp.classAssignments.map((ca) => ca.subjectId));
      return {
        usn: fp.user.usn,
        name: fp.user.name,
        designation: fp.designation,
        subjectCount: subjectCodes.size,
        sectionCount: fp.classAssignments.length,
      };
    });

    // Section stats from student_profiles
    const semester = "2"; // Default semester, could be made dynamic

    const sectionGroups = await prisma.studentProfile.groupBy({
      by: ["section", "semester"],
      where: {
        user: { departmentId: deptId, isActive: true, role: "STUDENT" },
      },
      _count: { id: true },
    });

    // Attendance shortage: find students with <75% attendance
    const allStudentProfiles = await prisma.studentProfile.findMany({
      where: {
        user: { departmentId: deptId, isActive: true, role: "STUDENT" },
        semester,
      },
      include: {
        user: { select: { usn: true, name: true } },
        attendance: true,
      },
    });

    const attendanceShortage: any[] = [];
    for (const sp of allStudentProfiles) {
      const total = sp.attendance.length;
      if (total === 0) continue;
      const present = sp.attendance.filter((a) => a.status === "PRESENT").length;
      const pct = (present / total) * 100;
      if (pct < 75) {
        attendanceShortage.push({
          usn: sp.user.usn,
          name: sp.user.name,
          section: sp.section,
          attendance: Math.round(pct * 10) / 10,
          shortage: Math.round((75 - pct) * 10) / 10,
          totalClasses: total,
          presentClasses: present,
        });
      }
    }

    // Subject assignment summary
    const deptSubjects = await prisma.subject.findMany({
      where: { departmentId: deptId, semester },
      include: {
        classAssignments: {
          where: { isActive: true },
          select: { section: true, faculty: { select: { id: true } } },
        },
      },
    });

    // Sections in this dept
    const deptSections = [...new Set(allStudentProfiles.map((sp) => sp.section))];
    const totalSlots = deptSubjects.length * deptSections.length;
    const assignedSlots = deptSubjects.reduce(
      (sum, s) => sum + s.classAssignments.length,
      0
    );

    // Top unassigned subjects (with fewest assignments)
    const unassignedList = deptSubjects
      .filter((s) => {
        const assignedSections = new Set(s.classAssignments.map((ca) => ca.section));
        return deptSections.some((sec) => !assignedSections.has(sec));
      })
      .slice(0, 10)
      .map((s) => ({
        subjectCode: s.code,
        subjectName: s.name,
        semester: s.semester,
        assignedSections: s.classAssignments.map((ca) => ca.section),
        missingSections: deptSections.filter(
          (sec) => !s.classAssignments.some((ca) => ca.section === sec)
        ),
      }));

    ok(res, {
      departmentId: deptId,
      studentCount,
      facultyCount: facultyProfiles.length,
      semester,
      sections: deptSections,
      sectionStats: sectionGroups.map((sg) => ({
        section: sg.section,
        semester: sg.semester,
        count: sg._count.id,
      })),
      attendanceShortage: attendanceShortage.slice(0, 20),
      shortageCount: attendanceShortage.length,
      facultyWorkload,
      subjectAssignments: {
        totalSlots,
        assignedSlots,
        unassignedSlots: totalSlots - assignedSlots,
        totalSubjects: deptSubjects.length,
        totalSections: deptSections.length,
        unassignedList,
      },
    });
  })
);

export default router;
