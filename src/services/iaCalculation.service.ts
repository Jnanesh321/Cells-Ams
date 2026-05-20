export type SubQuestionMark = {
  label: string;
  maxMarks: number;
  marksObtained: number;
};

export type QuestionMarks = {
  questionNumber: number;
  maxMarks: number;
  subQuestions: SubQuestionMark[];
};

export type StudentResult = {
  studentProfileId: number;
  usn: string;
  name: string;
  isAbsent: boolean;
  questions: QuestionMarks[];
  sectionATotal: number; // max of Q1_total, Q2_total
  sectionBTotal: number; // max of Q3_total, Q4_total
  grandTotal: number; // sectionATotal + sectionBTotal
  maxMarks: number;
};

export function computeIAResult(params: {
  studentProfileId: number;
  usn: string;
  name: string;
  isAbsent: boolean;
  subMarks: Array<{
    label: string;
    maxMarks: number;
    marksObtained: number;
    questionNumber: number;
    questionMaxMarks: number;
  }>;
  paperMaxMarks: number;
}): StudentResult {
  const { studentProfileId, usn, name, isAbsent, subMarks, paperMaxMarks } = params;

  const questionsMap = new Map<
    number,
    { maxMarks: number; subQuestions: SubQuestionMark[] }
  >();

  for (const sm of subMarks) {
    if (!questionsMap.has(sm.questionNumber)) {
      questionsMap.set(sm.questionNumber, {
        maxMarks: sm.questionMaxMarks,
        subQuestions: [],
      });
    }
    questionsMap.get(sm.questionNumber)!.subQuestions.push({
      label: sm.label,
      maxMarks: sm.maxMarks,
      marksObtained: isAbsent ? 0 : sm.marksObtained,
    });
  }

  const questions: QuestionMarks[] = [];
  for (const [qNum, q] of questionsMap) {
    questions.push({
      questionNumber: qNum,
      maxMarks: q.maxMarks,
      subQuestions: q.subQuestions,
    });
  }
  questions.sort((a, b) => a.questionNumber - b.questionNumber);

  const qTotals = [0, 0, 0, 0];
  for (const q of questions) {
    const total = q.subQuestions.reduce((s, sq) => s + sq.marksObtained, 0);
    qTotals[q.questionNumber - 1] = total;
  }

  const q1 = qTotals[0] ?? 0;
  const q2 = qTotals[1] ?? 0;
  const q3 = qTotals[2] ?? 0;
  const q4 = qTotals[3] ?? 0;

  const sectionATotal = Math.max(q1, q2);
  const sectionBTotal = Math.max(q3, q4);
  const grandTotal = Math.min(sectionATotal + sectionBTotal, 50);

  return {
    studentProfileId,
    usn,
    name,
    isAbsent,
    questions,
    sectionATotal,
    sectionBTotal,
    grandTotal,
    maxMarks: paperMaxMarks,
  };
}

export function computeLabResult(params: {
  components: Array<{ component: string; maxMarks: number; marksObtained: number }>;
}): { components: typeof params.components; total: number; maxMarks: number } {
  const total = params.components.reduce((s, c) => s + c.marksObtained, 0);
  const maxMarks = params.components.reduce((s, c) => s + c.maxMarks, 0);
  return { components: params.components, total, maxMarks };
}
