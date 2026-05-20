import type { PeriodSlot, TimetableEntry } from '../types';

export const MOCK_PERIODS: PeriodSlot[] = [
  { id: 1, name: 'Period 1', startTime: '09:00', endTime: '09:50', order: 1 },
  { id: 2, name: 'Period 2', startTime: '09:50', endTime: '10:40', order: 2 },
  { id: 3, name: 'Break', startTime: '10:40', endTime: '11:00', order: 3 },
  { id: 4, name: 'Period 3', startTime: '11:00', endTime: '11:50', order: 4 },
  { id: 5, name: 'Period 4', startTime: '11:50', endTime: '12:40', order: 5 },
  { id: 6, name: 'Lunch', startTime: '12:40', endTime: '13:40', order: 6 },
  { id: 7, name: 'Period 5', startTime: '13:40', endTime: '14:30', order: 7 },
  { id: 8, name: 'Period 6', startTime: '14:30', endTime: '15:20', order: 8 },
  { id: 9, name: 'Period 7', startTime: '15:20', endTime: '16:10', order: 9 },
];

const subjects: Record<string, { code: string; name: string; semester: number; credits: number }> = {
  CS501: { code: 'BCS501', name: 'Advanced Data Structures', semester: 5, credits: 4 },
  CS502: { code: 'BCS502', name: 'Database Management Systems', semester: 5, credits: 4 },
  CS503: { code: 'BCS503', name: 'Software Engineering', semester: 5, credits: 3 },
  CS504: { code: 'BCS504', name: 'Computer Networks', semester: 5, credits: 4 },
  CS505: { code: 'BCS505', name: 'Machine Learning', semester: 5, credits: 3 },
  CS5L1: { code: 'BCSL506', name: 'DBMS Lab', semester: 5, credits: 1.5 },
  CS5L2: { code: 'BCSL507', name: 'Network Programming Lab', semester: 5, credits: 1.5 },
};

const PERIOD_IDS = [1, 2, 4, 5, 7, 8, 9];
const BREAK_ID = 3;
const LUNCH_ID = 6;
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function makeEntry(day: number, periodId: number, subjectCode: string): TimetableEntry {
  const subj = subjects[subjectCode];
  const period = MOCK_PERIODS.find((p) => p.id === periodId)!;
  return {
    id: day * 100 + periodId,
    dayNumber: day,
    periodId,
    period,
    subjectId: parseInt(subjectCode.replace(/\D/g, '').slice(0, 4), 10),
    subject: subj ?? null,
    section: 'A',
    semester: '5',
    academicYear: '2024-25',
    isActive: true,
  };
}

const DAY_SCHEDULES: Record<number, [number, string][]> = {
  1: [[1, 'CS501'], [2, 'CS502'], [4, 'CS504'], [5, 'CS501'], [7, 'CS503'], [8, 'CS5L1'], [9, 'CS5L1']],
  2: [[1, 'CS503'], [2, 'CS504'], [4, 'CS502'], [5, 'CS505'], [7, 'CS501'], [8, 'CS5L2'], [9, 'CS5L2']],
  3: [[1, 'CS502'], [2, 'CS505'], [4, 'CS501'], [5, 'CS504'], [7, 'CS503'], [8, 'CS5L1'], [9, 'CS5L1']],
  4: [[1, 'CS504'], [2, 'CS501'], [4, 'CS503'], [5, 'CS502'], [7, 'CS505'], [8, 'CS5L2'], [9, 'CS5L2']],
  5: [[1, 'CS505'], [2, 'CS503'], [4, 'CS502'], [5, 'CS501'], [7, 'CS504']],
  6: [[1, 'CS5L1'], [2, 'CS5L2'], [4, 'CS501'], [5, 'CS502']],
};

export const MOCK_TIMETABLE: TimetableEntry[] = [];
for (const [day, slots] of Object.entries(DAY_SCHEDULES)) {
  for (const [periodId, subjectCode] of slots) {
    if (subjectCode) {
      MOCK_TIMETABLE.push(makeEntry(parseInt(day), periodId, subjectCode));
    }
  }
}

export function getTimetableForDay(dayNumber: number, section = 'A'): TimetableEntry[] {
  return MOCK_TIMETABLE
    .filter((e) => e.dayNumber === dayNumber && e.section === section)
    .sort((a, b) => a.period.order - b.period.order);
}

export function getFullWeekTimetable(section = 'A'): Record<number, TimetableEntry[]> {
  const week: Record<number, TimetableEntry[]> = {};
  for (let d = 1; d <= 6; d++) {
    week[d] = getTimetableForDay(d, section);
  }
  return week;
}

export function getDayName(dayNumber: number): string {
  return DAY_NAMES[dayNumber - 1] ?? `Day ${dayNumber}`;
}
