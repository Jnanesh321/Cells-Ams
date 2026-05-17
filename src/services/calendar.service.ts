import { prisma } from "../config/prisma";

export async function getCalendarEvents(type?: string) {
  const where: any = {};

  if (type) {
    where.type = type;
  }

  return prisma.academicCalendar.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      type: true,
    },
  });
}
