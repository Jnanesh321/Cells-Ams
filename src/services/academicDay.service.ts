import { prisma } from "../config/prisma";

const ACADEMIC_DAY_CYCLE = 6;

export interface AcademicDayInfo {
  date: Date;
  dayNumber: number;
  dayType: "working" | "holiday" | "exam" | "suspended" | "event";
  title?: string;
  isWorking: boolean;
}

export async function getAcademicDayForDate(date: Date): Promise<AcademicDayInfo> {
  const normalized = new Date(date.toISOString().split("T")[0]);

  const override = await prisma.dayOverride.findUnique({
    where: { date: normalized },
  });

  if (override && override.dayType !== "working") {
    return {
      date: normalized,
      dayNumber: 0,
      dayType: override.dayType as AcademicDayInfo["dayType"],
      title: override.title ?? undefined,
      isWorking: false,
    };
  }

  const state = await prisma.academicDayState.findFirst({
    where: { isActive: true },
    orderBy: { id: "desc" },
  });

  if (!state) {
    const created = await prisma.academicDayState.create({
      data: { currentDay: 1, academicYear: getCurrentAcademicYear() },
    });
    return {
      date: normalized,
      dayNumber: created.currentDay,
      dayType: "working",
      isWorking: true,
    };
  }

  if (normalized <= state.lastUpdated) {
    return {
      date: normalized,
      dayNumber: state.currentDay,
      dayType: "working",
      isWorking: true,
    };
  }

  const workingDays = await countWorkingDays(new Date(state.lastUpdated), normalized);

  if (workingDays === 0) {
    return {
      date: normalized,
      dayNumber: state.currentDay,
      dayType: "working",
      isWorking: true,
    };
  }

  let newDay = state.currentDay;
  for (let i = 0; i < workingDays; i++) {
    newDay = (newDay % ACADEMIC_DAY_CYCLE) + 1;
  }

  await prisma.academicDayState.update({
    where: { id: state.id },
    data: { currentDay: newDay },
  });

  return {
    date: normalized,
    dayNumber: newDay,
    dayType: "working",
    isWorking: true,
  };
}

export async function advanceAcademicDay(): Promise<AcademicDayInfo> {
  const state = await prisma.academicDayState.findFirst({
    where: { isActive: true },
    orderBy: { id: "desc" },
  });

  if (!state) {
    return getAcademicDayForDate(new Date());
  }

  const nextWorkingDate = await findNextWorkingDay(new Date(state.lastUpdated));
  if (!nextWorkingDate) {
    return {
      date: new Date(),
      dayNumber: state.currentDay,
      dayType: "working",
      isWorking: true,
    };
  }

  let newDay = (state.currentDay % ACADEMIC_DAY_CYCLE) + 1;

  await prisma.academicDayState.update({
    where: { id: state.id },
    data: { currentDay: newDay },
  });

  return {
    date: nextWorkingDate,
    dayNumber: newDay,
    dayType: "working",
    isWorking: true,
  };
}

export async function setAcademicDayOverride(
  date: Date,
  dayType: string,
  title?: string,
  departmentId?: number
) {
  const normalized = new Date(date.toISOString().split("T")[0]);

  if (dayType === "working") {
    const where: any = { date: normalized };
    if (departmentId !== undefined) where.departmentId = departmentId;
    await prisma.dayOverride.deleteMany({ where });
    return { message: "Override removed" };
  }

  await prisma.dayOverride.upsert({
    where: { date: normalized },
    update: { dayType, title, departmentId: departmentId ?? null },
    create: {
      date: normalized,
      dayType,
      title,
      departmentId: departmentId ?? null,
    },
  });

  return { message: `Date marked as ${dayType}` };
}

export async function getOverrides(from?: Date, to?: Date) {
  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }

  return prisma.dayOverride.findMany({
    where,
    orderBy: { date: "asc" },
    include: { department: { select: { name: true, code: true } } },
  });
}

async function countWorkingDays(from: Date, to: Date): Promise<number> {
  const overrides = await prisma.dayOverride.findMany({
    where: {
      date: { gte: from, lte: to },
      departmentId: null,
    },
    select: { date: true, dayType: true },
  });

  const nonWorkingDates = new Set(
    overrides
      .filter((o) => o.dayType !== "working")
      .map((o) => o.date.toISOString().split("T")[0])
  );

  let count = 0;
  const current = new Date(from);
  current.setDate(current.getDate() + 1);

  while (current <= to) {
    const dateStr = current.toISOString().split("T")[0];
    if (!nonWorkingDates.has(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

async function findNextWorkingDay(from: Date): Promise<Date | null> {
  const maxLookahead = 365;
  const current = new Date(from);

  for (let i = 0; i < maxLookahead; i++) {
    current.setDate(current.getDate() + 1);

    const override = await prisma.dayOverride.findUnique({
      where: { date: current },
    });

    if (!override || override.dayType === "working") {
      return current;
    }
  }

  return null;
}

export async function getTodayScheduleForSection(section: string) {
  const today = new Date();
  const dayInfo = await getAcademicDayForDate(today);

  if (!dayInfo.isWorking) {
    return { dayInfo, periods: [] };
  }

  const entries = await prisma.timetableEntry.findMany({
    where: {
      dayNumber: dayInfo.dayNumber,
      section,
      isActive: true,
    },
    include: {
      period: true,
      subject: { select: { id: true, code: true, name: true, semester: true } },
    },
    orderBy: { period: { order: "asc" } },
  });

  return { dayInfo, periods: entries };
}

export async function getFacultyDaySchedule(facultyProfileId: number) {
  const today = new Date();
  const dayInfo = await getAcademicDayForDate(today);

  if (!dayInfo.isWorking) {
    return { dayInfo, periods: [] };
  }

  const assignments = await prisma.classAssignment.findMany({
    where: { facultyProfileId, isActive: true },
    select: { subjectId: true, section: true, subject: { select: { id: true, code: true, name: true, semester: true } } },
  });

  const sectionSubjectMap = new Map(
    assignments.map((a) => [`${a.section}-${a.subjectId}`, a])
  );

  const entries = await prisma.timetableEntry.findMany({
    where: {
      dayNumber: dayInfo.dayNumber,
      isActive: true,
      section: { in: assignments.map((a) => a.section) },
    },
    include: { period: true, subject: true },
    orderBy: { period: { order: "asc" } },
  });

  const myPeriods = entries.filter((e) => {
    const key = `${e.section}-${e.subjectId}`;
    return sectionSubjectMap.has(key);
  });

  return {
    dayInfo,
    periods: myPeriods.map((e) => ({
      id: e.id,
      periodName: e.period.name,
      startTime: e.period.startTime,
      endTime: e.period.endTime,
      periodOrder: e.period.order,
      periodType: e.period.type,
      subjectCode: e.subject.code,
      subjectName: e.subject.name,
      section: e.section,
      semester: e.subject.semester,
    })),
  };
}

function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 6) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export async function initAcademicDayState() {
  const existing = await prisma.academicDayState.findFirst({
    where: { isActive: true },
  });

  if (!existing) {
    await prisma.academicDayState.create({
      data: { currentDay: 1, academicYear: getCurrentAcademicYear() },
    });
  }
}
