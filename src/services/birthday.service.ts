import { prisma } from "../config/prisma";

export interface BirthdayPerson {
  userId: number;
  name: string;
  role: string;
  department?: string;
  dateOfBirth: string;
}

export async function getTodaysBirthdays() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const students = await prisma.studentProfile.findMany({
    where: {
      dateOfBirth: { not: null },
      user: { isActive: true },
    },
    select: {
      userId: true,
      dateOfBirth: true,
      user: {
        select: {
          name: true,
          department: { select: { name: true, code: true } },
          birthdayVisibility: { select: { visible: true } },
        },
      },
    },
  });

  const faculty = (await prisma.facultyProfile.findMany({
    where: {
      dateOfBirth: { not: null },
      user: { isActive: true },
    },
    select: {
      userId: true,
      dateOfBirth: true,
      user: {
        select: {
          name: true,
          department: { select: { name: true, code: true } },
          birthdayVisibility: { select: { visible: true } },
        },
      },
    },
  })) as any;

  const birthdays: BirthdayPerson[] = [];

  for (const s of students) {
    if (!s.dateOfBirth) continue;
    const dob = new Date(s.dateOfBirth);
    if (dob.getMonth() + 1 === month && dob.getDate() === day) {
      const visible = s.user.birthdayVisibility?.visible ?? true;
      if (visible) {
        birthdays.push({
          userId: s.userId,
          name: s.user.name,
          role: "STUDENT",
          department: s.user.department?.name ?? undefined,
          dateOfBirth: s.dateOfBirth.toISOString().split("T")[0],
        });
      }
    }
  }

  for (const f of faculty) {
    if (!f.dateOfBirth) continue;
    const dob = new Date(f.dateOfBirth);
    if (dob.getMonth() + 1 === month && dob.getDate() === day) {
      const visible = f.user.birthdayVisibility?.visible ?? true;
      if (visible) {
        birthdays.push({
          userId: f.userId,
          name: f.user.name,
          role: "FACULTY",
          department: f.user.department?.name ?? undefined,
          dateOfBirth: f.dateOfBirth.toISOString().split("T")[0],
        });
      }
    }
  }

  return birthdays;
}

export async function setBirthdayVisibility(userId: number, visible: boolean) {
  return prisma.birthdayVisibility.upsert({
    where: { userId },
    update: { visible },
    create: { userId, visible },
  });
}

export async function getBirthdayVisibility(userId: number) {
  const setting = await prisma.birthdayVisibility.findUnique({
    where: { userId },
  });
  return setting?.visible ?? true;
}
