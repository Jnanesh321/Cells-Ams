import { AttendanceStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function markBulkAttendance(
  subjectId: number,
  section: string,
  date: Date,
  records: { studentProfileId: number; status: AttendanceStatus }[],
  markedByUserId: number
) {
  const normalizedDate = new Date(date.toISOString().split("T")[0]);

  await prisma.classAssignment.findFirstOrThrow({
    where: { subjectId, section, isActive: true },
  });

  return prisma.attendanceRecord.createMany({
    data: records.map((r) => ({
      studentProfileId: r.studentProfileId,
      subjectId,
      date: normalizedDate,
      status: r.status,
      markedByUserId,
    })),
    skipDuplicates: true,
  });
}

export async function updateAttendanceRecord(
  studentProfileId: number,
  subjectId: number,
  date: Date,
  status: AttendanceStatus,
  updatedByUserId: number,
  reason: string
) {
  const normalizedDate = new Date(date.toISOString().split("T")[0]);

  const result = await prisma.attendanceRecord.upsert({
    where: {
      studentProfileId_subjectId_date: {
        studentProfileId,
        subjectId,
        date: normalizedDate,
      },
    },
    update: { status, markedByUserId: updatedByUserId },
    create: {
      studentProfileId,
      subjectId,
      date: normalizedDate,
      status,
      markedByUserId: updatedByUserId,
    },
  });

  void reason;
  return result;
}

export async function getStudentAttendanceSummary(usn: string) {
  const student = await prisma.user.findUnique({
    where: { usn },
    include: {
      studentProfile: {
        include: {
          attendance: { include: { subject: true } },
        },
      },
    },
  });

  if (!student?.studentProfile) return [];

  const bySubject = new Map<
    number,
    { name: string; code: string; present: number; total: number }
  >();

  for (const record of student.studentProfile.attendance) {
    const cur = bySubject.get(record.subjectId) ?? {
      name: record.subject.name,
      code: record.subject.code,
      present: 0,
      total: 0,
    };

    cur.total += 1;
    if (record.status === "PRESENT") cur.present += 1;

    bySubject.set(record.subjectId, cur);
  }

  return Array.from(bySubject.values()).map((s) => ({
    ...s,
    percentage: s.total > 0 ? parseFloat(((s.present / s.total) * 100).toFixed(1)) : 0,
  }));
}

export async function getAttendanceSession(
  subjectId: number,
  section: string,
  date: Date,
  iaNumber = 1
) {
  const normalizedDate = new Date(date.toISOString().split("T")[0]);

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { departmentId: true },
  });

  if (!subject) {
    throw Object.assign(new Error("Subject not found"), { status: 404 });
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      section,
      user: {
        role: "STUDENT",
        departmentId: subject.departmentId,
      },
    },
    include: {
      user: { select: { usn: true, name: true } },
      attendance: {
        where: { subjectId, date: normalizedDate },
        select: { status: true },
        take: 1,
      },
      iaMarks: {
        where: { subjectId, iaNumber },
        select: { marksObtained: true },
        take: 1,
      },
    },
    orderBy: { user: { usn: "asc" } },
  });

  return students.map((s) => ({
    studentProfileId: s.id,
    usn: s.user.usn,
    name: s.user.name,
    todayStatus: s.attendance[0]?.status ?? null,
    existingMark: s.iaMarks[0]?.marksObtained ?? null,
  }));
}

export async function getStudentAttendanceSession(
  timetableEntryId: number,
  section: string,
  date: Date
) {
  const entry = await prisma.timetableEntry.findUnique({
    where: { id: timetableEntryId },
    include: { subject: { select: { departmentId: true, id: true } } },
  });

  if (!entry) {
    throw Object.assign(new Error("Timetable entry not found"), { status: 404 });
  }

  const normalizedDate = new Date(date.toISOString().split("T")[0]);

  const students = await prisma.studentProfile.findMany({
    where: {
      section,
      user: { role: "STUDENT", departmentId: entry.subject.departmentId },
    },
    include: {
      user: { select: { usn: true, name: true } },
      attendance: {
        where: { subjectId: entry.subjectId, date: normalizedDate },
        select: { status: true },
        take: 1,
      },
    },
    orderBy: { user: { usn: "asc" } },
  });

  return students.map((s) => ({
    studentProfileId: s.id,
    usn: s.user.usn,
    name: s.user.name,
    subjectId: entry.subjectId,
    todayStatus: s.attendance[0]?.status ?? null,
  }));
}
