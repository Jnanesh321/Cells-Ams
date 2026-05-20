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

// =========== VTU IA SYSTEM ===========

function calcVTUIATotal(q1: number, q2: number, q3: number, q4: number) {
  const sectionA = Math.max(Math.min(q1, 25), 0, Math.min(q2, 25));
  const sectionB = Math.max(Math.min(q3, 25), 0, Math.min(q4, 25));
  return {
    sectionA: Math.max(sectionA, 0),
    sectionB: Math.max(sectionB, 0),
    total: Math.min(sectionA + sectionB, 50),
  };
}

export async function upsertVTUIAMarks(
  subjectId: number,
  iaNumber: number,
  entries: { studentProfileId: number; q1: number; q2: number; q3: number; q4: number }[],
  enteredByUserId: number
) {
  const results = await Promise.all(
    entries.map(async (e) => {
      const calc = calcVTUIATotal(e.q1, e.q2, e.q3, e.q4);
      return prisma.vTUIAMark.upsert({
        where: {
          studentProfileId_subjectId_iaNumber: {
            studentProfileId: e.studentProfileId,
            subjectId,
            iaNumber,
          },
        },
        update: {
          q1: e.q1, q2: e.q2, q3: e.q3, q4: e.q4,
          sectionA: calc.sectionA, sectionB: calc.sectionB,
          total: calc.total,
          enteredByUserId,
        },
        create: {
          studentProfileId: e.studentProfileId,
          subjectId, iaNumber,
          q1: e.q1, q2: e.q2, q3: e.q3, q4: e.q4,
          sectionA: calc.sectionA, sectionB: calc.sectionB,
          total: calc.total,
          enteredByUserId,
        },
      });
    })
  );
  return { updated: results.length };
}

export async function getStudentVTUIAMarks(usn: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { user: { usn } },
    include: {
      vtuIAMarks: {
        include: { subject: true },
        orderBy: [{ subjectId: "asc" }, { iaNumber: "asc" }],
      },
    },
  });
  if (!profile) return [];

  const bySubject = new Map<number, any>();
  for (const m of profile.vtuIAMarks) {
    const cur = bySubject.get(m.subjectId) ?? {
      subjectCode: m.subject.code,
      subjectName: m.subject.name,
      ia1: null as any, ia2: null as any, ia3: null as any,
    };
    const entry = {
      q1: m.q1, q2: m.q2, q3: m.q3, q4: m.q4,
      sectionA: m.sectionA, sectionB: m.sectionB, total: m.total,
    };
    if (m.iaNumber === 1) cur.ia1 = entry;
    if (m.iaNumber === 2) cur.ia2 = entry;
    if (m.iaNumber === 3) cur.ia3 = entry;
    bySubject.set(m.subjectId, cur);
  }
  return Array.from(bySubject.values());
}

export async function getStudentVTUCIESummary(usn: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { user: { usn } },
    include: {
      vtuCIESummaries: {
        include: { subject: true },
      },
    },
  });
  if (!profile?.vtuCIESummaries) return [];

  return profile.vtuCIESummaries.map((s) => ({
    subjectCode: s.subject.code,
    subjectName: s.subject.name,
    ia1Total: s.ia1Total,
    ia2Total: s.ia2Total,
    ia3Total: s.ia3Total,
    bestTwoTotal: s.bestTwoTotal,
    finalCIE: s.finalCIE,
    isEligible: s.isEligible,
    finalized: s.finalized,
  }));
}

export async function computeVTUCIESummary(studentProfileId: number, subjectId: number) {
  const marks = await prisma.vTUIAMark.findMany({
    where: { studentProfileId, subjectId },
    orderBy: { iaNumber: "asc" },
  });

  const ia1Total = marks.find((m) => m.iaNumber === 1)?.total ?? 0;
  const ia2Total = marks.find((m) => m.iaNumber === 2)?.total ?? 0;
  const ia3Total = marks.find((m) => m.iaNumber === 3)?.total ?? 0;

  const totals = [ia1Total, ia2Total, ia3Total]
    .filter((v) => v > 0)
    .sort((a, b) => b - a);

  const bestTwoTotal = totals.length >= 2
    ? totals[0] + totals[1]
    : totals.length === 1
      ? totals[0]
      : 0;

  const finalCIE = Math.min(bestTwoTotal, 50);
  const isEligible = true;

  return prisma.vTUCIESummary.upsert({
    where: { studentProfileId_subjectId: { studentProfileId, subjectId } },
    update: { ia1Total, ia2Total, ia3Total, bestTwoTotal, finalCIE, isEligible },
    create: { studentProfileId, subjectId, ia1Total, ia2Total, ia3Total, bestTwoTotal, finalCIE, isEligible },
  });
}
