import type { VTUIAMarkEntry, VTUCIEDisplay } from '../types';

export interface VTUIAMarksData {
  studentProfileId: number;
  usn: string;
  name: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
}

function calcSectionA(q1: number | null, q2: number | null): number {
  const v1 = q1 ?? 0;
  const v2 = q2 ?? 0;
  return Math.max(v1, v2);
}

function calcSectionB(q3: number | null, q4: number | null): number {
  const v1 = q3 ?? 0;
  const v2 = q4 ?? 0;
  return Math.max(v1, v2);
}

function buildVTUEntry(s: VTUIAMarksData): VTUIAMarkEntry {
  const sectionA = calcSectionA(s.q1, s.q2);
  const sectionB = calcSectionB(s.q3, s.q4);
  return {
    studentProfileId: s.studentProfileId,
    usn: s.usn,
    name: s.name,
    q1: s.q1,
    q2: s.q2,
    q3: s.q3,
    q4: s.q4,
    sectionA,
    sectionB,
    total: sectionA + sectionB,
  };
}

// Per-subject mock data keyed by `subjectCode_section`
const MOCK_VTU_IA_DATA: Record<string, Record<string, VTUIAMarksData[]>> = {
  '21CS53_A': {
    ia1: [
      { studentProfileId: 1, usn: '4VP21CS001', name: 'Aditya Kumar', q1: 20, q2: 22, q3: 18, q4: 21 },
      { studentProfileId: 2, usn: '4VP21CS002', name: 'Priya Sharma', q1: 24, q2: 23, q3: 22, q4: 25 },
      { studentProfileId: 3, usn: '4VP21CS003', name: 'Rajesh Patel', q1: 15, q2: 18, q3: 14, q4: 16 },
      { studentProfileId: 4, usn: '4VP21CS004', name: 'Neha Gupta', q1: 21, q2: 20, q3: 22, q4: 19 },
    ],
    ia2: [
      { studentProfileId: 1, usn: '4VP21CS001', name: 'Aditya Kumar', q1: 23, q2: 21, q3: 20, q4: 22 },
      { studentProfileId: 2, usn: '4VP21CS002', name: 'Priya Sharma', q1: 25, q2: 24, q3: 23, q4: 25 },
      { studentProfileId: 3, usn: '4VP21CS003', name: 'Rajesh Patel', q1: 16, q2: 14, q3: 15, q4: 17 },
      { studentProfileId: 4, usn: '4VP21CS004', name: 'Neha Gupta', q1: 20, q2: 22, q3: 21, q4: 20 },
    ],
    ia3: [
      { studentProfileId: 1, usn: '4VP21CS001', name: 'Aditya Kumar', q1: null, q2: null, q3: null, q4: null },
      { studentProfileId: 2, usn: '4VP21CS002', name: 'Priya Sharma', q1: null, q2: null, q3: null, q4: null },
      { studentProfileId: 3, usn: '4VP21CS003', name: 'Rajesh Patel', q1: null, q2: null, q3: null, q4: null },
      { studentProfileId: 4, usn: '4VP21CS004', name: 'Neha Gupta', q1: null, q2: null, q3: null, q4: null },
    ],
  },
  '21CS53_B': {
    ia1: [
      { studentProfileId: 5, usn: '4VP21CS005', name: 'Vikram Singh', q1: 12, q2: 10, q3: 8, q4: 11 },
      { studentProfileId: 6, usn: '4VP21CS006', name: 'Divya Menon', q1: 18, q2: 20, q3: 17, q4: 19 },
    ],
    ia2: [
      { studentProfileId: 5, usn: '4VP21CS005', name: 'Vikram Singh', q1: 14, q2: 11, q3: 10, q4: 13 },
      { studentProfileId: 6, usn: '4VP21CS006', name: 'Divya Menon', q1: 20, q2: 22, q3: 19, q4: 21 },
    ],
    ia3: [
      { studentProfileId: 5, usn: '4VP21CS005', name: 'Vikram Singh', q1: null, q2: null, q3: null, q4: null },
      { studentProfileId: 6, usn: '4VP21CS006', name: 'Divya Menon', q1: null, q2: null, q3: null, q4: null },
    ],
  },
};

export function getVTUIAMarks(subjectCode: string, section: string, iaNumber: number): VTUIAMarkEntry[] {
  const key = `${subjectCode}_${section}`;
  const subjectData = MOCK_VTU_IA_DATA[key];
  if (!subjectData) return [];
  const iaData = subjectData[`ia${iaNumber}`];
  if (!iaData) return [];
  return iaData.map(buildVTUEntry);
}

export function saveVTUIAMarks(
  subjectCode: string,
  section: string,
  iaNumber: number,
  entries: { studentProfileId: number; q1: number; q2: number; q3: number; q4: number }[]
): boolean {
  const key = `${subjectCode}_${section}`;
  if (!MOCK_VTU_IA_DATA[key]) {
    MOCK_VTU_IA_DATA[key] = {};
  }
  MOCK_VTU_IA_DATA[key][`ia${iaNumber}`] = entries.map(e => {
    const student = Object.values(MOCK_VTU_IA_DATA)
      .flatMap(s => Object.values(s).flat())
      .find(s => s.studentProfileId === e.studentProfileId);
    return {
      studentProfileId: e.studentProfileId,
      usn: student?.usn ?? '',
      name: student?.name ?? '',
      q1: e.q1,
      q2: e.q2,
      q3: e.q3,
      q4: e.q4,
    };
  });
  return true;
}

export function getVTUStudentCIEDisplay(usn: string): VTUCIEDisplay[] {
  const results: VTUCIEDisplay[] = [];
  for (const [key, subjectData] of Object.entries(MOCK_VTU_IA_DATA)) {
    const subjectCode = key.split('_')[0];
    const studentIa1 = (subjectData.ia1 ?? []).find(s => s.usn === usn);
    const studentIa2 = (subjectData.ia2 ?? []).find(s => s.usn === usn);
    const studentIa3 = (subjectData.ia3 ?? []).find(s => s.usn === usn);

    const ia1Display = studentIa1 ? buildVTUEntry(studentIa1) : null;
    const ia2Display = studentIa2 ? buildVTUEntry(studentIa2) : null;
    const ia3Display = studentIa3 ? buildVTUEntry(studentIa3) : null;

    const totals = [ia1Display?.total ?? 0, ia2Display?.total ?? 0, ia3Display?.total ?? 0].filter(t => t > 0);
    const sorted = [...totals].sort((a, b) => b - a);
    const bestTwoTotal = sorted.length >= 2 ? sorted[0] + sorted[1] : sorted.length === 1 ? sorted[0] : 0;

    results.push({
      subjectCode,
      subjectName: getSubjectName(subjectCode),
      ia1: ia1Display,
      ia2: ia2Display,
      ia3: ia3Display,
      bestTwoTotal,
      finalCIE: bestTwoTotal,
      isEligible: true,
      finalized: false,
    });
  }
  return results;
}

function getSubjectName(code: string): string {
  const names: Record<string, string> = {
    '21CS53': 'Data Structures',
    '21CS52': 'Algorithms',
    '21CS54': 'Web Development',
  };
  return names[code] ?? code;
}
