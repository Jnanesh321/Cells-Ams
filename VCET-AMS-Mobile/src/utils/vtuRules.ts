// ============================================================
// VTU Academic Rules Engine
// Vivekananda College of Engineering & Technology, Puttur
// ============================================================

// VTU CIE Scheme:
//   IA1 = 30 marks
//   IA2 = 30 marks
//   IA3 = 30 marks
//   Best 2 of 3 IAs = 30 marks (scaled to 30)
//   Assignment/Quiz = 10 marks
//   CIE Total = 40 marks
//   SEE = 60 marks
//   Final = CIE + SEE = 100 marks

export const VTU_RULES = {
  IA_MAX: 50,
  CIE_IA_MAX: 50,
  CIE_ASSIGNMENT_MAX: 10,
  CIE_TOTAL: 40,
  SEE_TOTAL: 60,
  FINAL_TOTAL: 100,
  ATTENDANCE_THRESHOLD: 75,
  DETENTION_CIE_THRESHOLD: 14, // < 14/40
  CIE_CALC_MODE: 'BEST_OF_THREE' as const, // or 'AVERAGE'
} as const;

type CIEMarks = {
  ia1?: number;
  ia2?: number;
  ia3?: number;
  assignment?: number;
};

/**
 * Calculate CIE from IA marks using VTU rules.
 * Best 2 of 3 IAs scaled to 30 + assignment (max 10) = CIE total (max 40)
 */
export function calculateCIE(marks: CIEMarks, iaMax = VTU_RULES.CIE_IA_MAX): {
  iaBestTwo: number;
  cieFromIA: number;
  assignment: number;
  cieTotal: number;
  isEligible: boolean;
} {
  const iaValues = [marks.ia1, marks.ia2, marks.ia3]
    .filter((v): v is number => v != null && v >= 0)
    .sort((a, b) => b - a);

  const bestTwo = iaValues.slice(0, 2);
  const iaBestTwo = bestTwo.reduce((s, v) => s + v, 0);
  const assignment = Math.min(Math.max(marks.assignment ?? 0, 0), VTU_RULES.CIE_ASSIGNMENT_MAX);
  const cieFromIA = Math.min(iaBestTwo, iaMax);
  const cieTotal = Math.min(cieFromIA + assignment, VTU_RULES.CIE_TOTAL);
  const isEligible = cieTotal >= VTU_RULES.DETENTION_CIE_THRESHOLD;

  return { iaBestTwo, cieFromIA, assignment, cieTotal, isEligible };
}

/**
 * Calculate attendance percentage
 */
export function calcAttendance(present: number, total: number): number {
  if (total <= 0) return 0;
  return parseFloat(((present / total) * 100).toFixed(1));
}

/**
 * Determine detention status per VTU rules
 */
export function getDetentionStatus(
  attendancePercent: number,
  cieTotal: number,
  config?: { attendanceThreshold?: number; cieThreshold?: number }
): {
  detained: boolean;
  reasons: string[];
  attendanceShortage: number;
  cieShortage: number;
} {
  const attThreshold = config?.attendanceThreshold ?? VTU_RULES.ATTENDANCE_THRESHOLD;
  const cieThreshold = config?.cieThreshold ?? VTU_RULES.DETENTION_CIE_THRESHOLD;
  const reasons: string[] = [];

  const attendanceShortage = attThreshold - attendancePercent;
  const cieShortage = cieThreshold - cieTotal;

  if (attendancePercent < attThreshold) {
    reasons.push(`Attendance ${attendancePercent}% below ${attThreshold}% threshold`);
  }
  if (cieTotal < cieThreshold) {
    reasons.push(`CIE ${cieTotal} marks below ${cieThreshold} threshold`);
  }

  return {
    detained: reasons.length > 0,
    reasons,
    attendanceShortage: attendanceShortage > 0 ? parseFloat(attendanceShortage.toFixed(1)) : 0,
    cieShortage: cieShortage > 0 ? cieShortage : 0,
  };
}

/**
 * Calculate required remaining attendance to meet threshold
 */
export function calcRequiredAttendance(
  present: number,
  total: number,
  threshold = 75
): { currentPercent: number; neededPercent: number; additionalDaysNeeded: number } {
  const currentPercent = calcAttendance(present, total);
  if (currentPercent >= threshold) {
    return { currentPercent, neededPercent: 0, additionalDaysNeeded: 0 };
  }
  // Solve: (present + x) / (total + x) = threshold / 100
  // x = (threshold * total - 100 * present) / (100 - threshold)
  const x = Math.ceil((threshold * total - 100 * present) / (100 - threshold));
  return {
    currentPercent,
    neededPercent: parseFloat((threshold - currentPercent).toFixed(1)),
    additionalDaysNeeded: Math.max(0, x),
  };
}

/**
 * Generate a random CIE marks distribution for demo data
 */
export function generateDemoCIEMarks(): { ia1: number; ia2: number; ia3: number; assignment: number } {
  const ia1 = 18 + Math.floor(Math.random() * 13);
  const ia2 = 16 + Math.floor(Math.random() * 15);
  const ia3 = 14 + Math.floor(Math.random() * 16);
  const assignment = 5 + Math.floor(Math.random() * 6);
  return { ia1, ia2, ia3, assignment };
}

/**
 * VTU attendance shortage warning levels
 */
export function getAttendanceWarningLevel(percent: number): 'critical' | 'warning' | 'safe' {
  if (percent < 65) return 'critical';
  if (percent < 75) return 'warning';
  return 'safe';
}

export function getAttendanceWarningColor(level: 'critical' | 'warning' | 'safe'): string {
  switch (level) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'safe': return '#10b981';
  }
}

/**
 * Format CIE display for UI
 */
export function formatCIEDisplay(marks: CIEMarks, iaMax = VTU_RULES.CIE_IA_MAX): string {
  const cie = calculateCIE(marks, iaMax);
  const parts = [
    `IA: ${cie.iaBestTwo}/${iaMax}`,
    `Asgn: ${cie.assignment}/${VTU_RULES.CIE_ASSIGNMENT_MAX}`,
    `CIE: ${cie.cieTotal}/${VTU_RULES.CIE_TOTAL}`,
  ];
  if (!cie.isEligible) parts.push('⚠️ Below threshold');
  return parts.join(' • ');
}

// ==================== VTU IA CALCULATION (Q1-Q4 System) ====================

export interface VTUIACalculationResult {
  sectionA: number;
  sectionB: number;
  total: number;
}

export interface VTUBestTwoResult {
  bestTwoTotal: number;
  finalCIE: number;
}

const QUESTION_MAX = 25;
const IA_MAX = 50;

export function calcVTUIATotal(
  q1: number | null,
  q2: number | null,
  q3: number | null,
  q4: number | null
): VTUIACalculationResult {
  const v1 = Math.min(Math.max(q1 ?? 0, 0), QUESTION_MAX);
  const v2 = Math.min(Math.max(q2 ?? 0, 0), QUESTION_MAX);
  const v3 = Math.min(Math.max(q3 ?? 0, 0), QUESTION_MAX);
  const v4 = Math.min(Math.max(q4 ?? 0, 0), QUESTION_MAX);

  const sectionA = Math.max(v1, v2);
  const sectionB = Math.max(v3, v4);
  const total = Math.min(sectionA + sectionB, IA_MAX);

  return { sectionA, sectionB, total };
}

export function calcVTUBestTwo(
  ia1: number | null,
  ia2: number | null,
  ia3: number | null
): VTUBestTwoResult {
  const totals = [ia1, ia2, ia3]
    .filter((v): v is number => v != null && v > 0)
    .sort((a, b) => b - a);

  const bestTwoTotal = totals.length >= 2
    ? totals[0] + totals[1]
    : totals.length === 1
      ? totals[0]
      : 0;

  return { bestTwoTotal, finalCIE: Math.min(bestTwoTotal, IA_MAX) };
}

export function validateVTUQuestion(value: number | null): boolean {
  if (value == null) return true; // empty = valid
  return value >= 0 && value <= QUESTION_MAX;
}

export function validateVTUIAEntry(q1: number | null, q2: number | null, q3: number | null, q4: number | null): string | null {
  if (q1 == null && q2 == null && q3 == null && q4 == null) {
    return 'At least one question must have marks';
  }
  if (q1 != null && !validateVTUQuestion(q1)) return 'Q1 must be 0-25';
  if (q2 != null && !validateVTUQuestion(q2)) return 'Q2 must be 0-25';
  if (q3 != null && !validateVTUQuestion(q3)) return 'Q3 must be 0-25';
  if (q4 != null && !validateVTUQuestion(q4)) return 'Q4 must be 0-25';
  return null;
}
