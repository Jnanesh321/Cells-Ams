import { prisma } from "../config/prisma";

export async function computeDetention(departmentCode: string) {
  const dept = await prisma.department.findUnique({
    where: { code: departmentCode },
    select: { id: true, name: true },
  });
  if (!dept) throw new Error("Department not found");

  const students = await prisma.studentProfile.findMany({
    where: {
      user: { departmentId: dept.id, role: "STUDENT", isActive: true },
    },
    include: {
      user: { select: { usn: true, name: true } },
    },
  });

  // Get all subjects for this department's current semester students
  const subjects = await prisma.subject.findMany({
    where: { departmentId: dept.id },
    select: { id: true, code: true, name: true, semester: true },
  });

  const semester = subjects[0]?.semester ?? "4";

  const results = await Promise.all(
    students.map(async (sp) => {
      const reasons: string[] = [];
      let worstAttendance = 100;
      let worstCIE = 50;
      const academicYear = "2025-2026";

      for (const sub of subjects) {
        // Attendance calculation
        const totalClasses = await prisma.attendanceRecord.count({
          where: { studentProfileId: sp.id, subjectId: sub.id },
        });
        const presentClasses = await prisma.attendanceRecord.count({
          where: {
            studentProfileId: sp.id,
            subjectId: sub.id,
            status: "PRESENT",
          },
        });

        const attendancePercent = totalClasses > 0
          ? Math.round((presentClasses / totalClasses) * 100)
          : 100;

        if (attendancePercent < 75) {
          reasons.push(`Attendance shortage in ${sub.code} (${attendancePercent}%)`);
          worstAttendance = Math.min(worstAttendance, attendancePercent);
        }

        // CIE check
        const cie = await prisma.cIESummary.findUnique({
          where: {
            studentProfileId_subjectId: {
              studentProfileId: sp.id,
              subjectId: sub.id,
            },
          },
        });

        if (cie && cie.cieTotal < 20) {
          reasons.push(`CIE below threshold in ${sub.code} (${cie.cieTotal}/50)`);
          worstCIE = Math.min(worstCIE, cie.cieTotal);
        }
      }

      const isDetained = reasons.length > 0;

      const detention = await prisma.detentionRecord.upsert({
        where: {
          studentProfileId_academicYear_semester: {
            studentProfileId: sp.id,
            academicYear,
            semester,
          },
        },
        update: {
          isDetained,
          detentionReasons: reasons,
          attendancePercent: worstAttendance,
          cieTotal: worstCIE,
        },
        create: {
          studentProfileId: sp.id,
          academicYear,
          semester,
          isDetained,
          detentionReasons: reasons,
          attendancePercent: worstAttendance,
          cieTotal: worstCIE,
        },
      });

      return {
        usn: sp.user.usn,
        name: sp.user.name,
        isDetained,
        reasons,
        attendancePercent: worstAttendance,
        cieTotal: worstCIE,
        detention,
      };
    })
  );

  const detained = results.filter((r) => r.isDetained);
  return {
    department: dept.name,
    totalStudents: results.length,
    detained: detained.length,
    notDetained: results.length - detained.length,
    results,
  };
}

export async function listDetention(
  departmentCode: string,
  exempted?: boolean
) {
  const dept = await prisma.department.findUnique({
    where: { code: departmentCode },
    select: { id: true },
  });
  if (!dept) throw new Error("Department not found");

  const where: any = {
    studentProfile: {
      user: { departmentId: dept.id, role: "STUDENT" },
    },
  };
  if (exempted !== undefined) where.exempted = exempted;

  const records = await prisma.detentionRecord.findMany({
    where,
    include: {
      studentProfile: {
        include: { user: { select: { usn: true, name: true } } },
      },
      exemptedBy: { select: { name: true, usn: true } },
    },
    orderBy: { studentProfile: { user: { usn: "asc" } } },
  });

  return records.map((r) => ({
    id: r.id,
    studentProfileId: r.studentProfileId,
    usn: r.studentProfile.user.usn,
    name: r.studentProfile.user.name,
    academicYear: r.academicYear,
    semester: r.semester,
    isDetained: r.isDetained,
    reasons: r.detentionReasons,
    attendancePercent: r.attendancePercent,
    cieTotal: r.cieTotal,
    exempted: r.exempted,
    exemptedBy: r.exemptedBy
      ? { name: r.exemptedBy.name, usn: r.exemptedBy.usn }
      : null,
    createdAt: r.createdAt,
  }));
}

export async function getStudentDetention(usn: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { user: { usn } },
    include: {
      detentionRecords: {
        orderBy: { createdAt: "desc" },
        include: {
          exemptedBy: { select: { name: true, usn: true } },
        },
      },
    },
  });
  if (!profile) throw new Error("Student not found");

  return profile.detentionRecords.map((r) => ({
    id: r.id,
    academicYear: r.academicYear,
    semester: r.semester,
    isDetained: r.isDetained,
    reasons: r.detentionReasons,
    attendancePercent: r.attendancePercent,
    cieTotal: r.cieTotal,
    exempted: r.exempted,
    exemptedBy: r.exemptedBy
      ? { name: r.exemptedBy.name, usn: r.exemptedBy.usn }
      : null,
  }));
}

export async function exemptStudent(
  studentProfileId: number,
  reason: string,
  academicYear: string,
  semester: string,
  exemptedByUserId: number
) {
  const existing = await prisma.detentionRecord.findUnique({
    where: {
      studentProfileId_academicYear_semester: {
        studentProfileId,
        academicYear,
        semester,
      },
    },
  });
  if (!existing) throw new Error("Detention record not found for this student");

  return prisma.detentionRecord.update({
    where: { id: existing.id },
    data: {
      exempted: true,
      exemptedByUserId,
      detentionReasons: [
        ...existing.detentionReasons,
        `EXEMPTED: ${reason} (by HOD #${exemptedByUserId})`,
      ],
    },
  });
}

export async function revokeExemption(id: number) {
  const record = await prisma.detentionRecord.findUnique({ where: { id } });
  if (!record) throw new Error("Detention record not found");

  return prisma.detentionRecord.update({
    where: { id },
    data: {
      exempted: false,
      exemptedByUserId: null,
      detentionReasons: record.detentionReasons.filter(
        (r) => !r.startsWith("EXEMPTED:")
      ),
    },
  });
}
