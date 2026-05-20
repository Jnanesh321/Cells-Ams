import type { BirthdayRecord } from '../types';
import { mockStudents } from './students';

function getMMDD(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const birthdayMap: BirthdayRecord[] = mockStudents
  .filter((s) => s.dateOfBirth)
  .map((s) => ({
    usn: s.usn,
    name: s.name,
    date: getMMDD(s.dateOfBirth!),
    department: s.department,
  }));

export function getTodaysBirthdays(): BirthdayRecord[] {
  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return birthdayMap.filter((b) => b.date === mmdd);
}

export function getDepartmentBirthdays(department: string): BirthdayRecord[] {
  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return birthdayMap.filter((b) => b.date === mmdd && b.department === department);
}

export function getStudentBirthday(usn: string): BirthdayRecord | undefined {
  return birthdayMap.find((b) => b.usn === usn);
}
