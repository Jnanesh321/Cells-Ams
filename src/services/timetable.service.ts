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
