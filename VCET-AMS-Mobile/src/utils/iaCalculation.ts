export type SubQuestionMark = {
  label: string;
  maxMarks: number;
  marksObtained: number;
};

export type StudentResult = {
  studentProfileId?: number;
  usn: string;
  name: string;
  isAbsent: boolean;
  questions: {
    questionNumber: number;
    maxMarks: number;
    subQuestions: SubQuestionMark[];
  }[];
  sectionATotal: number;
  sectionBTotal: number;
  grandTotal: number;
  maxMarks: number;
};

export function computeIAResult(params: {
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
  const { usn, name, isAbsent, subMarks, paperMaxMarks } = params;

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

  const questions = Array.from(questionsMap.entries())
    .map(([qNum, q]) => ({
      questionNumber: qNum,
      maxMarks: q.maxMarks,
      subQuestions: q.subQuestions,
    }))
    .sort((a, b) => a.questionNumber - b.questionNumber);

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
