import type { BirthdayRecord } from '../types';

// Birthday data: MM-DD format for cross-year matching
const BIRTHDAYS: BirthdayRecord[] = [
  { usn: '4VP21CS001', name: 'Aditya Kumar', date: '05-14', department: 'CSE' },
  { usn: '4VP21CS005', name: 'Rohan Pillai', date: '05-15', department: 'CSE' },
  { usn: '4VP21CS008', name: 'Omkar Desai', date: '05-16', department: 'CSE' },
  { usn: '4VP21CS003', name: 'Rajesh Patel', date: '06-02', department: 'CSE' },
  { usn: '4VP21EC001', name: 'Sneha Reddy', date: '06-10', department: 'ECE' },
  { usn: '4VP21CS010', name: 'Kavya Singh', date: '05-14', department: 'CSE' },
];

export function getTodaysBirthdays(): BirthdayRecord[] {
  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return BIRTHDAYS.filter((b) => b.date === mmdd);
}

export function getDepartmentBirthdays(department: string): BirthdayRecord[] {
  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return BIRTHDAYS.filter((b) => b.date === mmdd && b.department === department);
}
