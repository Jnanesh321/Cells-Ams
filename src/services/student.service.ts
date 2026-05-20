import { prisma } from "../config/prisma";

export async function getFullProfile(usn: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { user: { usn } },
    include: {
      user: {
        select: {
          usn: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          department: { select: { name: true, code: true } },
        },
      },
      cieSummaries: {
        include: { subject: { select: { code: true, name: true } } },
      },
      detentionRecords: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      attendance: {
        include: { subject: { select: { code: true, name: true } } },
      },
    },
  });

  if (!profile) throw new Error("Student not found");

  const attendanceBySubject = new Map<string, { present: number; total: number }>();
  for (const a of profile.attendance) {
    const key = a.subject.code;
    const cur = attendanceBySubject.get(key) ?? { present: 0, total: 0 };
    cur.total++;
    if (a.status === "PRESENT") cur.present++;
    attendanceBySubject.set(key, cur);
  }

  return {
    usn: profile.user.usn,
    name: profile.user.name,
    email: profile.user.email,
    department: profile.user.department,
    semester: profile.semester,
    section: profile.section,
    batch: profile.batch,
    dateOfBirth: profile.dateOfBirth,
    // Personal
    fatherName: profile.fatherName,
    motherName: profile.motherName,
    fatherOccupation: profile.fatherOccupation,
    motherOccupation: profile.motherOccupation,
    fatherPhone: profile.fatherPhone,
    motherPhone: profile.motherPhone,
    studentPhone: profile.studentPhone,
    permanentAddress: profile.permanentAddress,
    currentAddress: profile.currentAddress,
    bloodGroup: profile.bloodGroup,
    nationality: profile.nationality,
    religion: profile.religion,
    category: profile.category,
    // Previous education
    tenthMarks: profile.tenthMarks,
    tenthBoard: profile.tenthBoard,
    tenthPassYear: profile.tenthPassYear,
    pucMarks: profile.pucMarks,
    pucBoard: profile.pucBoard,
    pucPassYear: profile.pucPassYear,
    cetRank: profile.cetRank,
    cetScore: profile.cetScore,
    diplomaMarks: profile.diplomaMarks,
    // Additional
    hobbies: profile.hobbies,
    achievements: profile.achievements,
    isLateralEntry: profile.isLateralEntry,
    admissionType: profile.admissionType,
    photoUrl: profile.photoUrl,
    // Computed
    attendance: Array.from(attendanceBySubject.entries()).map(([code, v]) => ({
      subjectCode: code,
      present: v.present,
      total: v.total,
      percent: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    })),
    cieSummaries: profile.cieSummaries.map((c) => ({
      subjectCode: c.subject.code,
      subjectName: c.subject.name,
      cieTotal: c.cieTotal,
      isEligible: c.isEligible,
      finalized: c.finalized,
    })),
    detention: profile.detentionRecords[0] ?? null,
  };
}

export async function updateProfile(
  userId: number,
  data: Record<string, unknown>
) {
  const allowedFields = [
    "studentPhone",
    "currentAddress",
    "permanentAddress",
    "bloodGroup",
    "hobbies",
    "achievements",
    "photoUrl",
  ];

  const updateData: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  return prisma.studentProfile.update({
    where: { userId },
    data: updateData,
  });
}
