import { prisma } from "../config/prisma";

export interface CreateTimetableEntryInput {
  dayNumber: number;
  periodId: number;
  subjectId: number;
  section: string;
  semester: string;
  academicYear: string;
}

export async function createTimetableEntry(data: CreateTimetableEntryInput) {
  return prisma.timetableEntry.create({ data });
}

export async function bulkCreateTimetable(entries: CreateTimetableEntryInput[]) {
  return prisma.timetableEntry.createMany({
    data: entries,
    skipDuplicates: true,
  });
}

export async function getTimetableForDay(
  dayNumber: number,
  section: string,
  academicYear?: string
) {
  const where: any = { dayNumber, section, isActive: true };
  if (academicYear) where.academicYear = academicYear;

  return prisma.timetableEntry.findMany({
    where,
    include: {
      period: true,
      subject: {
        select: { id: true, code: true, name: true, semester: true, credits: true },
      },
    },
    orderBy: { period: { order: "asc" } },
  });
}

export async function getFullWeekTimetable(
  section: string,
  academicYear?: string
) {
  const where: any = { section, isActive: true };
  if (academicYear) where.academicYear = academicYear;

  const entries = await prisma.timetableEntry.findMany({
    where,
    include: {
      period: true,
      subject: {
        select: { id: true, code: true, name: true, semester: true, credits: true },
      },
    },
    orderBy: [{ dayNumber: "asc" }, { period: { order: "asc" } }],
  });

  const byDay: Record<number, typeof entries> = {};
  for (const e of entries) {
    if (!byDay[e.dayNumber]) byDay[e.dayNumber] = [];
    byDay[e.dayNumber].push(e);
  }

  return byDay;
}

export async function removeTimetableEntry(id: number) {
  return prisma.timetableEntry.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function updateTimetableEntry(id: number, data: Partial<CreateTimetableEntryInput>) {
  return prisma.timetableEntry.update({
    where: { id },
    data,
  });
}

export async function getFacultyTimetable(userId: number) {
  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!faculty) throw new Error("Faculty profile not found");

  const assignments = await prisma.classAssignment.findMany({
    where: { facultyProfileId: faculty.id, isActive: true },
    select: { section: true, academicYear: true, semester: true },
  });

  if (assignments.length === 0) return [];

  const sections = assignments.map((a) => a.section);
  const entries = await prisma.timetableEntry.findMany({
    where: { section: { in: sections }, isActive: true },
    include: {
      period: true,
      subject: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: [{ dayNumber: "asc" }, { period: { order: "asc" } }],
  });

  const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const seen = new Set<string>();

  return entries.filter((e) => {
    const key = `${e.dayNumber}-${e.periodId}-${e.section}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((e) => ({
    day: DAY_NAMES[e.dayNumber] ?? `Day ${e.dayNumber}`,
    startTime: e.period.startTime,
    endTime: e.period.endTime,
    subjectName: e.subject.name,
    subjectCode: e.subject.code,
    section: e.section,
  }));
}

export async function getAllPeriods() {
  return prisma.period.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createPeriod(data: { name: string; startTime: string; endTime: string; type: string; order: number }) {
  return prisma.period.create({ data });
}

export async function deletePeriod(id: number) {
  await prisma.timetableEntry.deleteMany({ where: { periodId: id } });
  return prisma.period.delete({ where: { id } });
}
