import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function getNotices(role?: string | null, departmentId?: number | null) {
  const where: Prisma.NoticeWhereInput = { isActive: true };

  if (role) {
    where.OR = [
      { targetRole: role as any },
      { targetRole: null },
    ];
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  return prisma.notice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      content: true,
      targetRole: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function createNotice(data: {
  title: string;
  content: string;
  targetRole?: string | null;
  departmentId?: number | null;
  postedByUserId: number;
}) {
  return prisma.notice.create({
    data: {
      title: data.title,
      content: data.content,
      targetRole: data.targetRole as any ?? null,
      departmentId: data.departmentId ?? null,
      postedByUserId: data.postedByUserId,
    },
  });
}
