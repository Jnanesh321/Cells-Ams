import { prisma } from "../config/prisma";

export async function upsertIAMarks(
  subjectId: number,
  iaNumber: number,
  entries: { studentProfileId: number; marksObtained: number }[],
  enteredByUserId: number,
  maxMarks = 30
) {
  const results = await Promise.all(
    entries.map((e) =>
      prisma.iAMark.upsert({
        where: {
          studentProfileId_subjectId_iaNumber: {
            studentProfileId: e.studentProfileId,
            subjectId,
            iaNumber,
          },
        },
        update: { marksObtained: e.marksObtained, enteredByUserId, maxMarks },
        create: {
          studentProfileId: e.studentProfileId,
          subjectId,
          iaNumber,
          marksObtained: e.marksObtained,
          maxMarks,
          enteredByUserId,
        },
      })
    )
  );

  return { updated: results.length };
}

export async function getStudentMarks(usn: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { user: { usn } },
    include: {
      iaMarks: { include: { subject: true } },
    },
  });

  if (!profile) return [];

  const bySubject = new Map<
    number,
    { code: string; name: string; ia1?: number; ia2?: number; ia3?: number }
  >();

  for (const m of profile.iaMarks) {
    const cur = bySubject.get(m.subjectId) ?? {
      code: m.subject.code,
      name: m.subject.name,
    };

    if (m.iaNumber === 1) cur.ia1 = m.marksObtained;
    if (m.iaNumber === 2) cur.ia2 = m.marksObtained;
    if (m.iaNumber === 3) cur.ia3 = m.marksObtained;

    bySubject.set(m.subjectId, cur);
  }

  return Array.from(bySubject.values());
}

export async function getDeptMarksForHoD(deptId: number) {
  return prisma.studentProfile.findMany({
    where: { user: { departmentId: deptId, role: "STUDENT" } },
    include: {
      user: { select: { name: true, usn: true } },
      iaMarks: { include: { subject: true } },
    },
    orderBy: { user: { usn: "asc" } },
  });
}
