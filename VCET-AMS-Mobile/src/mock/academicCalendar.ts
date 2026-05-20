export type AcademicCalendarEntry = {
  date: string;
  type: 'term_start' | 'term_end' | 'holiday' | 'event' | 'exam';
  label: string;
};

export const ACADEMIC_YEAR = '2025-26';

export const TERMS: { label: string; start: string; end: string }[] = [
  { label: 'Odd Semester 2025-26', start: '2025-08-04', end: '2025-12-20' },
  { label: 'Even Semester 2025-26', start: '2026-01-05', end: '2026-05-22' },
];

export const ACADEMIC_CALENDAR: AcademicCalendarEntry[] = [
  { date: '2025-08-04', type: 'term_start', label: 'Odd Semester Begins' },
  { date: '2025-08-15', type: 'holiday', label: 'Independence Day' },
  { date: '2025-08-27', type: 'event', label: 'Ganesh Chaturthi' },
  { date: '2025-09-05', type: 'event', label: 'Teachers\' Day' },
  { date: '2025-09-15', type: 'exam', label: 'IA-1 Examinations' },
  { date: '2025-09-16', type: 'exam', label: 'IA-1 Examinations' },
  { date: '2025-09-17', type: 'exam', label: 'IA-1 Examinations' },
  { date: '2025-10-02', type: 'holiday', label: 'Gandhi Jayanti' },
  { date: '2025-10-21', type: 'event', label: 'Dussehra' },
  { date: '2025-10-28', type: 'exam', label: 'IA-2 Examinations' },
  { date: '2025-10-29', type: 'exam', label: 'IA-2 Examinations' },
  { date: '2025-10-30', type: 'exam', label: 'IA-2 Examinations' },
  { date: '2025-11-01', type: 'event', label: 'Kannada Rajyotsava' },
  { date: '2025-11-10', type: 'event', label: 'Deepawali' },
  { date: '2025-11-11', type: 'event', label: 'Deepawali Holiday' },
  { date: '2025-12-01', type: 'exam', label: 'IA-3 Examinations' },
  { date: '2025-12-02', type: 'exam', label: 'IA-3 Examinations' },
  { date: '2025-12-03', type: 'exam', label: 'IA-3 Examinations' },
  { date: '2025-12-15', type: 'event', label: 'Technical Symposium' },
  { date: '2025-12-20', type: 'term_end', label: 'Odd Semester Ends' },
  { date: '2026-01-05', type: 'term_start', label: 'Even Semester Begins' },
  { date: '2026-01-12', type: 'event', label: 'Makara Sankranti' },
  { date: '2026-01-26', type: 'holiday', label: 'Republic Day' },
  { date: '2026-02-16', type: 'exam', label: 'IA-1 Examinations' },
  { date: '2026-02-17', type: 'exam', label: 'IA-1 Examinations' },
  { date: '2026-02-18', type: 'exam', label: 'IA-1 Examinations' },
  { date: '2026-03-13', type: 'event', label: 'Holi' },
  { date: '2026-03-25', type: 'exam', label: 'IA-2 Examinations' },
  { date: '2026-03-26', type: 'exam', label: 'IA-2 Examinations' },
  { date: '2026-03-27', type: 'exam', label: 'IA-2 Examinations' },
  { date: '2026-04-14', type: 'event', label: 'Ambedkar Jayanti' },
  { date: '2026-04-22', type: 'exam', label: 'IA-3 Examinations' },
  { date: '2026-04-23', type: 'exam', label: 'IA-3 Examinations' },
  { date: '2026-04-24', type: 'exam', label: 'IA-3 Examinations' },
  { date: '2026-05-01', type: 'holiday', label: 'Labour Day' },
  { date: '2026-05-22', type: 'term_end', label: 'Even Semester Ends' },
];
