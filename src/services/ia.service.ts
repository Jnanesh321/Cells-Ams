import { prisma } from "../config/prisma";
import { computeIAResult, computeLabResult, type SubQuestionMark } from "./iaCalculation.service";

// ── Question Paper ──

export async function createQuestionPaper(data: {
  subjectId: number;
  iaNumber: number;
  semester: string;
  section: string;
  academicYear: string;
  totalMarks?: number;
  duration?: number;
  createdByUserId: number;
}) {
  return prisma.iAQuestionPaper.create({ data });
}

export async function listQuestionPapers(filters: {
  subjectId?: number;
  iaNumber?: number;
  section?: string;
  academicYear?: string;
}) {
  const where: any = {};
  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.iaNumber) where.iaNumber = filters.iaNumber;
  if (filters.section) where.section = filters.section;
  if (filters.academicYear) where.academicYear = filters.academicYear;
  return prisma.iAQuestionPaper.findMany({
    where,
    include: {
      subject: { select: { code: true, name: true } },
      createdBy: { select: { name: true, usn: true } },
      _count: { select: { questions: true } },
    },
    orderBy: [{ subjectId: "asc" }, { iaNumber: "asc" }],
  });
}

export async function getQuestionPaper(id: number) {
  return prisma.iAQuestionPaper.findUnique({
    where: { id },
    include: {
      subject: { select: { code: true, name: true, semester: true } },
      createdBy: { select: { name: true, usn: true } },
      questions: {
        orderBy: { questionNumber: "asc" },
        include: {
          subQuestions: { orderBy: { label: "asc" as const } },
        },
      },
    },
  });
}

export async function updateQuestionPaper(id: number, data: {
  totalMarks?: number;
  duration?: number;
  isActive?: boolean;
}) {
  return prisma.iAQuestionPaper.update({ where: { id }, data });
}

// ── Questions & Sub-questions ──

export async function addQuestions(questionPaperId: number, questions: Array<{
  questionNumber: number;
  text?: string;
  maxMarks?: number;
  subQuestions: Array<{ label: string; maxMarks?: number; text?: string }>;
}>) {
  return prisma.$transaction(
    questions.map((q) =>
      prisma.iAQuestion.create({
        data: {
          questionPaperId,
          questionNumber: q.questionNumber,
          text: q.text,
          maxMarks: q.maxMarks ?? 25,
          subQuestions: {
            create: q.subQuestions.map((sq) => ({
              label: sq.label,
              maxMarks: sq.maxMarks ?? 6,
              text: sq.text,
            })),
          },
        },
        include: { subQuestions: true },
      })
    )
  );
}

export async function updateQuestion(id: number, data: {
  text?: string;
  maxMarks?: number;
}) {
  return prisma.iAQuestion.update({ where: { id }, data });
}

export async function deleteQuestion(id: number) {
  return prisma.iAQuestion.delete({ where: { id } });
}

export async function addSubQuestions(questionId: number, subQuestions: Array<{
  label: string;
  maxMarks?: number;
  text?: string;
}>) {
  return Promise.all(
    subQuestions.map((sq) =>
      prisma.iASubQuestion.create({
        data: { questionId, label: sq.label, maxMarks: sq.maxMarks ?? 6, text: sq.text },
      })
    )
  );
}

// ── Marks Entry ──

export async function getMarksSpreadsheet(paperId: number) {
  const paper = await prisma.iAQuestionPaper.findUnique({
    where: { id: paperId },
    include: {
      questions: {
        orderBy: { questionNumber: "asc" },
        include: {
          subQuestions: { orderBy: { label: "asc" } },
        },
      },
    },
  });
  if (!paper) return null;

  const allSubQuestionIds = paper.questions.flatMap((q) =>
    q.subQuestions.map((sq) => sq.id)
  );

  const subjectStudents = await prisma.studentProfile.findMany({
    where: {
      semester: paper.semester,
      section: paper.section,
      user: { role: "STUDENT", isActive: true },
    },
    include: {
      user: { select: { usn: true, name: true } },
      iaSubMarks: {
        where: { subQuestionId: { in: allSubQuestionIds } },
      },
    },
    orderBy: { user: { usn: "asc" } },
  });

  const absentees = await prisma.iAAbsentee.findMany({
    where: { subjectId: paper.subjectId, iaNumber: paper.iaNumber },
  });
  const absentSet = new Set(absentees.map((a) => a.studentProfileId));

  const rows = subjectStudents.map((sp) => {
    const subMarks: Record<number, number> = {};
    for (const sm of sp.iaSubMarks) {
      subMarks[sm.subQuestionId] = sm.marksObtained;
    }

    return {
      studentProfileId: sp.id,
      usn: sp.user.usn,
      name: sp.user.name,
      isAbsent: absentSet.has(sp.id),
      marks: subMarks,
    };
  });

  return {
    paper,
    rows,
  };
}

export async function upsertMarks(
  paperId: number,
  entries: Array<{ studentProfileId: number; subQuestionId: number; marksObtained: number }>,
  enteredByUserId: number
) {
  const results = await Promise.all(
    entries.map((e) =>
      prisma.iAStudentSubMark.upsert({
        where: {
          studentProfileId_subQuestionId: {
            studentProfileId: e.studentProfileId,
            subQuestionId: e.subQuestionId,
          },
        },
        update: { marksObtained: e.marksObtained, enteredByUserId },
        create: {
          studentProfileId: e.studentProfileId,
          subQuestionId: e.subQuestionId,
          marksObtained: e.marksObtained,
          enteredByUserId,
        },
      })
    )
  );
  return { updated: results.length };
}

// ── Absentees ──

export async function getAbsentees(paperId: number) {
  const paper = await prisma.iAQuestionPaper.findUnique({
    where: { id: paperId },
    select: { subjectId: true, iaNumber: true, semester: true, section: true },
  });
  if (!paper) return null;

  const absentees = await prisma.iAAbsentee.findMany({
    where: { subjectId: paper.subjectId, iaNumber: paper.iaNumber },
    include: {
      studentProfile: {
        include: { user: { select: { usn: true, name: true } } },
      },
      markedBy: { select: { name: true, usn: true } },
    },
  });

  const allStudents = await prisma.studentProfile.findMany({
    where: {
      semester: paper.semester,
      section: paper.section,
      user: { role: "STUDENT", isActive: true },
    },
    include: { user: { select: { usn: true, name: true } } },
    orderBy: { user: { usn: "asc" } },
  });

  const absentIds = new Set(absentees.map((a) => a.studentProfileId));

  return {
    paper,
    students: allStudents.map((sp) => ({
      studentProfileId: sp.id,
      usn: sp.user.usn,
      name: sp.user.name,
      isAbsent: absentIds.has(sp.id),
    })),
    absentees,
  };
}

export async function markAbsentees(
  paperId: number,
  studentProfileIds: number[],
  markedByUserId: number
) {
  const paper = await prisma.iAQuestionPaper.findUnique({
    where: { id: paperId },
    select: { subjectId: true, iaNumber: true },
  });
  if (!paper) throw new Error("Paper not found");

  const created = await Promise.all(
    studentProfileIds.map((spId) =>
      prisma.iAAbsentee.upsert({
        where: {
          studentProfileId_subjectId_iaNumber: {
            studentProfileId: spId,
            subjectId: paper.subjectId,
            iaNumber: paper.iaNumber,
          },
        },
        update: { markedByUserId },
        create: {
          studentProfileId: spId,
          subjectId: paper.subjectId,
          iaNumber: paper.iaNumber,
          markedByUserId,
        },
      })
    )
  );
  return { marked: created.length };
}

export async function unmarkAbsentees(paperId: number, studentProfileIds: number[]) {
  const paper = await prisma.iAQuestionPaper.findUnique({
    where: { id: paperId },
    select: { subjectId: true, iaNumber: true },
  });
  if (!paper) throw new Error("Paper not found");

  const { count } = await prisma.iAAbsentee.deleteMany({
    where: {
      studentProfileId: { in: studentProfileIds },
      subjectId: paper.subjectId,
      iaNumber: paper.iaNumber,
    },
  });
  return { removed: count };
}

// ── Lab IA ──

export async function getLabConfig(subjectId: number) {
  return prisma.labIAConfig.findMany({
    where: { subjectId },
    orderBy: { component: "asc" },
  });
}

export async function upsertLabConfig(
  subjectId: number,
  components: Array<{ component: string; maxMarks: number; isExternal?: boolean }>,
  createdByUserId: number
) {
  const results = await Promise.all(
    components.map((c) =>
      prisma.labIAConfig.upsert({
        where: {
          subjectId_component: { subjectId, component: c.component },
        },
        update: { maxMarks: c.maxMarks, isExternal: c.isExternal ?? false, createdByUserId },
        create: {
          subjectId,
          component: c.component,
          maxMarks: c.maxMarks,
          isExternal: c.isExternal ?? false,
          createdByUserId,
        },
      })
    )
  );
  return results;
}

export async function getLabMarks(subjectId: number) {
  const config = await prisma.labIAConfig.findMany({
    where: { subjectId },
    orderBy: { component: "asc" },
  });

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { departmentId: true },
  });
  if (!subject) throw new Error("Subject not found");

  const students = await prisma.studentProfile.findMany({
    where: {
      user: { departmentId: subject.departmentId, role: "STUDENT", isActive: true },
    },
    include: {
      user: { select: { usn: true, name: true } },
      labIAMarks: { where: { subjectId } },
    },
    orderBy: { user: { usn: "asc" } },
  });

  const rows = students.map((sp) => {
    const marksByComponent: Record<string, { marksObtained: number; maxMarks: number }> = {};
    for (const lm of sp.labIAMarks) {
      marksByComponent[lm.component] = { marksObtained: lm.marksObtained, maxMarks: lm.maxMarks };
    }
    return {
      studentProfileId: sp.id,
      usn: sp.user.usn,
      name: sp.user.name,
      marks: marksByComponent,
    };
  });

  return { config, rows };
}

export async function upsertLabMarks(
  subjectId: number,
  entries: Array<{
    studentProfileId: number;
    component: string;
    marksObtained: number;
    maxMarks: number;
  }>,
  enteredByUserId: number
) {
  const results = await Promise.all(
    entries.map((e) =>
      prisma.labIAMark.upsert({
        where: {
          studentProfileId_subjectId_component: {
            studentProfileId: e.studentProfileId,
            subjectId,
            component: e.component,
          },
        },
        update: { marksObtained: e.marksObtained, maxMarks: e.maxMarks, enteredByUserId },
        create: {
          studentProfileId: e.studentProfileId,
          subjectId,
          component: e.component,
          marksObtained: e.marksObtained,
          maxMarks: e.maxMarks,
          enteredByUserId,
        },
      })
    )
  );
  return { updated: results.length };
}

// ── Result ──

export async function getResult(paperId: number) {
  const paper = await prisma.iAQuestionPaper.findUnique({
    where: { id: paperId },
    include: {
      questions: {
        orderBy: { questionNumber: "asc" },
        include: {
          subQuestions: { orderBy: { label: "asc" } },
        },
      },
    },
  });
  if (!paper) return null;

  const allSubQuestionIds = paper.questions.flatMap((q) =>
    q.subQuestions.map((sq) => sq.id)
  );

  const students = await prisma.studentProfile.findMany({
    where: {
      semester: paper.semester,
      section: paper.section,
      user: { role: "STUDENT", isActive: true },
    },
    include: {
      user: { select: { usn: true, name: true } },
      iaSubMarks: {
        where: { subQuestionId: { in: allSubQuestionIds } },
        include: {
          subQuestion: {
            include: { question: true },
          },
        },
      },
    },
    orderBy: { user: { usn: "asc" } },
  });

  const absentees = await prisma.iAAbsentee.findMany({
    where: { subjectId: paper.subjectId, iaNumber: paper.iaNumber },
  });
  const absentSet = new Set(absentees.map((a) => a.studentProfileId));

  const results = students.map((sp) => {
    const subMarks = sp.iaSubMarks.map((sm) => ({
      label: sm.subQuestion.label,
      maxMarks: sm.subQuestion.maxMarks,
      marksObtained: sm.marksObtained,
      questionNumber: sm.subQuestion.question.questionNumber,
      questionMaxMarks: sm.subQuestion.question.maxMarks,
    }));

    return computeIAResult({
      studentProfileId: sp.id,
      usn: sp.user.usn,
      name: sp.user.name,
      isAbsent: absentSet.has(sp.id),
      subMarks,
      paperMaxMarks: paper.totalMarks,
    });
  });

  return { paper, results };
}

// ── Student View ──

export async function getMyMarks(studentProfileId: number, subjectId: number) {
  const papers = await prisma.iAQuestionPaper.findMany({
    where: { subjectId, isActive: true },
    orderBy: { iaNumber: "asc" },
    include: {
      questions: {
        orderBy: { questionNumber: "asc" },
        include: {
          subQuestions: {
            orderBy: { label: "asc" },
            include: {
              studentSubMarks: {
                where: { studentProfileId },
              },
            },
          },
        },
      },
    },
  });

  const absentees = await prisma.iAAbsentee.findMany({
    where: { subjectId },
    select: { iaNumber: true },
  });
  const absentIANumbers = new Set(absentees.map((a) => a.iaNumber));

  const results = papers.map((paper) => {
    const isAbsent = absentIANumbers.has(paper.iaNumber);
    const subMarks: Array<{
      label: string;
      maxMarks: number;
      marksObtained: number;
      questionNumber: number;
      questionMaxMarks: number;
    }> = [];

    for (const q of paper.questions) {
      for (const sq of q.subQuestions) {
        subMarks.push({
          label: sq.label,
          maxMarks: sq.maxMarks,
          marksObtained: sq.studentSubMarks[0]?.marksObtained ?? 0,
          questionNumber: q.questionNumber,
          questionMaxMarks: q.maxMarks,
        });
      }
    }

    return computeIAResult({
      studentProfileId,
      usn: "",
      name: "",
      isAbsent,
      subMarks,
      paperMaxMarks: paper.totalMarks,
    });
  });

  return results;
}
