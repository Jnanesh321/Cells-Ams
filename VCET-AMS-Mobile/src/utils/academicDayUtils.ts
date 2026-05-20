import { AcademicDayInfo } from '../types';
import { TERMS, ACADEMIC_CALENDAR, AcademicCalendarEntry } from '../mock/academicCalendar';

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function countWorkingDays(start: Date, end: Date, holidays: Set<string>): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    if (!isWeekend(current) && !holidays.has(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function getDateFromString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getAcademicDayInfo(date: Date = new Date()): AcademicDayInfo | null {
  const dateStr = date.toISOString().slice(0, 10);
  const holidaySet = new Set(
    ACADEMIC_CALENDAR
      .filter((e) => e.type === 'holiday')
      .map((e) => e.date)
  );

  const term = TERMS.find((t) => {
    const start = getDateFromString(t.start);
    const end = getDateFromString(t.end);
    return date >= start && date <= end;
  });

  if (!term) {
    return null;
  }

  const termStart = getDateFromString(term.start);
  const termEnd = getDateFromString(term.end);

  const dayNumber = countWorkingDays(termStart, date, holidaySet);
  const totalDays = countWorkingDays(termStart, termEnd, holidaySet);
  const weekNumber = Math.ceil(dayNumber / 5);

  const todayEvent = ACADEMIC_CALENDAR.find((e) => e.date === dateStr && e.type !== 'term_start' && e.type !== 'term_end');

  return {
    dayNumber,
    totalDays,
    isHoliday: holidaySet.has(dateStr) || isWeekend(date),
    eventName: todayEvent?.label ?? null,
    weekNumber: Math.max(1, weekNumber),
    progress: totalDays > 0 ? dayNumber / totalDays : 0,
    termLabel: term.label,
    termStart: term.start,
    termEnd: term.end,
  };
}
