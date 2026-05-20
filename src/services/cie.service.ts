import { prisma } from "../config/prisma";

// ── Assignment Marks ──

export async function upsertAssignment(
  studentProfileId: number,
  subjectId: number,
  assignmentNumber: number,
  marksObtained: number,
  maxMarks: number,
  enteredByUserId: number
) {
  return prisma.assignmentMark.upsert({
    where: {
      studentProfileId_subjectId_assignmentNumber: {
        studentProfileId,
        subjectId,
        assignmentNumber,
      },
    },
    update: { marksObtained, maxMarks, enteredByUserId },
    create: {
      studentProfileId,
      subjectId,
      assignmentNumber,
      marksObtained,
      maxMarks,
      enteredByUserId,
    },
  });
}

export async function getSubjectAssignmentMarks(subjectId: number, section: string) {
  const students = await prisma.studentProfile.findMany({
    where: {
      section,
      user: { role: "STUDENT", isActive: true },
    },
    include: {
      user: { select: { usn: true, name: true } },
      assignmentMarks: { where: { subjectId } },
    },
    orderBy: { user: { usn: "asc" } },
  });

  return students.map((s) => ({
    studentProfileId: s.id,
    usn: s.user.usn,
    name: s.user.name,
    totalMarks: s.assignmentMarks.reduce((sum, a) => sum + a.marksObtained, 0),
    maxTotal: s.assignmentMarks.reduce((sum, a) => sum + a.maxMarks, 0) || 10,
    entries: s.assignmentMarks.map((a) => ({
      assignmentNumber: a.assignmentNumber,
      marksObtained: a.marksObtained,
      maxMarks: a.maxMarks,
    })),
  }));
}

// ── CIE Computation ──

function computeIATotalFromSubMarks(
  subMarks: Array<{ marksObtained: number; questionNumber: number }>
): number {
  const qTotals = [0, 0, 0, 0];
  for (const sm of subMarks) {
    const idx = sm.questionNumber - 1;
    if (idx >= 0 && idx < 4) qTotals[idx] += sm.marksObtained;
  }
  const sectionA = Math.max(qTotals[0] ?? 0, qTotals[1] ?? 0);
  const sectionB = Math.max(qTotals[2] ?? 0, qTotals[3] ?? 0);
  return Math.min(sectionA + sectionB, 50);
}

function computeIATotalFromVTU(
  mark: { q1: number; q2: number; q3: number; q4: number } | null
): number {
  if (!mark) return 0;
  const sectionA = Math.max(Math.min(mark.q1, 25), Math.min(mark.q2, 25));
  const sectionB = Math.max(Math.min(mark.q3, 25), Math.min(mark.q4, 25));
  return Math.min(sectionA + sectionB, 50);
}

export async function computeCIE(subjectId: number) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { departmentId: true, semester: true },
  });
  if (!subject) throw new Error("Subject not found");

  const students = await prisma.studentProfile.findMany({
    where: {
      user: { departmentId: subject.departmentId, role: "STUDENT", isActive: true },
    },
    include: {
      user: { select: { usn: true, name: true } },
    },
  });

  // Try new IA system first (IAStudentSubMark), fall back to VTU system (VTUIAMark)
  const papers = await prisma.iAQuestionPaper.findMany({
    where: { subjectId, isActive: true },
    include: {
      questions: {
        include: { subQuestions: true },
      },
    },
  });

  const hasNewSystem = papers.length > 0;

  const results = await Promise.all(
    students.map(async (sp) => {
      let iaTotals: number[];

      if (hasNewSystem) {
        // New system: compute from IAStudentSubMark
        const subMarks = await prisma.iAStudentSubMark.findMany({
          where: { studentProfileId: sp.id },
          include: {
            subQuestion: { include: { question: true } },
          },
        });

        iaTotals = [1, 2, 3].map((iaNum) => {
          const paper = papers.find((p) => p.iaNumber === iaNum);
          if (!paper) return 0;

          const subQuestionIds = new Set(
            paper.questions.flatMap((q) => q.subQuestions.map((sq) => sq.id))
          );

          const relevantMarks = subMarks
            .filter((sm) => subQuestionIds.has(sm.subQuestionId))
            .map((sm) => ({
              marksObtained: sm.marksObtained,
              questionNumber: sm.subQuestion.question.questionNumber,
            }));

          return computeIATotalFromSubMarks(relevantMarks);
        });
      } else {
        // Fallback to VTU system
        const vtuMarks = await prisma.vTUIAMark.findMany({
          where: { studentProfileId: sp.id, subjectId },
          orderBy: { iaNumber: "asc" },
        });

        iaTotals = [1, 2, 3].map(
          (iaNum) => computeIATotalFromVTU(vtuMarks.find((m) => m.iaNumber === iaNum) ?? null)
        );
      }

      // Assignment marks
      const assignmentMarks = await prisma.assignmentMark.findMany({
        where: { studentProfileId: sp.id, subjectId },
      });
      const assignmentTotal = assignmentMarks.reduce((s, a) => s + a.marksObtained, 0);

      // CIE calculation: best 2 IA average → portion out of 40, plus assignment out of 10
      const nonZeroIAs = iaTotals.filter((t) => t > 0).sort((a, b) => b - a);
      const bestTwo = nonZeroIAs.slice(0, 2);
      const bestTwoSum = bestTwo.reduce((s, v) => s + v, 0);
      const iaCount = bestTwo.length;

      // If 0 IAs entered, CIE = 0
      let cieFromIA = 0;
      let iaBestTwo = 0;

      if (iaCount > 0) {
        const iaAverage = bestTwoSum / iaCount; // average of best 2 out of 50
        iaBestTwo = bestTwoSum;
        cieFromIA = Math.round((iaAverage / 50) * 40 * 100) / 100; // scale to 40
      }

      const cieTotal = Math.min(cieFromIA + assignmentTotal, 50);
      const isEligible = cieTotal >= 20;

      const summary = await prisma.cIESummary.upsert({
        where: {
          studentProfileId_subjectId: {
            studentProfileId: sp.id,
            subjectId,
          },
        },
        update: {
          iaBestTwo,
          cieFromIA,
          assignmentTotal,
          cieTotal,
          isEligible,
        },
        create: {
          studentProfileId: sp.id,
          subjectId,
          iaBestTwo,
          cieFromIA,
          assignmentTotal,
          cieTotal,
          isEligible,
        },
      });

      return {
        usn: sp.user.usn,
        name: sp.user.name,
        iaTotals,
        iaBestTwo,
        cieFromIA,
        assignmentTotal,
        cieTotal,
        isEligible,
        summary,
      };
    })
  );

  const eligible = results.filter((r) => r.isEligible).length;
  const notEligible = results.filter((r) => !r.isEligible).length;

  return {
    subjectId,
    totalStudents: results.length,
    eligible,
    notEligible,
    results,
  };
}

export async function getStudentCIE(usn: string) {
  const profile = await prisma.studentProfile.findFirst({
    where: { user: { usn } },
    include: {
      cieSummaries: {
        include: { subject: { select: { code: true, name: true, semester: true } } },
      },
    },
  });
  if (!profile) throw new Error("Student not found");

  return profile.cieSummaries.map((c) => ({
    subjectCode: c.subject.code,
    subjectName: c.subject.name,
    semester: c.subject.semester,
    iaBestTwo: c.iaBestTwo,
    cieFromIA: c.cieFromIA,
    assignmentTotal: c.assignmentTotal,
    cieTotal: c.cieTotal,
    isEligible: c.isEligible,
    finalized: c.finalized,
  }));
}

export async function getSubjectCIE(subjectId: number) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { code: true, name: true, semester: true },
  });
  if (!subject) throw new Error("Subject not found");

  const cieSummaries = await prisma.cIESummary.findMany({
    where: { subjectId },
    include: {
      studentProfile: {
        include: { user: { select: { usn: true, name: true } } },
      },
    },
    orderBy: { studentProfile: { user: { usn: "asc" } } },
  });

  return {
    subject,
    totalStudents: cieSummaries.length,
    eligible: cieSummaries.filter((c) => c.isEligible).length,
    notEligible: cieSummaries.filter((c) => !c.isEligible).length,
    finalized: cieSummaries.every((c) => c.finalized),
    students: cieSummaries.map((c) => ({
      studentProfileId: c.studentProfileId,
      usn: c.studentProfile.user.usn,
      name: c.studentProfile.user.name,
      iaBestTwo: c.iaBestTwo,
      cieFromIA: c.cieFromIA,
      assignmentTotal: c.assignmentTotal,
      cieTotal: c.cieTotal,
      isEligible: c.isEligible,
      finalized: c.finalized,
    })),
  };
}

export async function finalizeCIE(subjectId: number, finalizedByUserId: number) {
  const result = await prisma.cIESummary.updateMany({
    where: { subjectId },
    data: { finalized: true, finalizedByUserId },
  });
  return { updated: result.count };
}
