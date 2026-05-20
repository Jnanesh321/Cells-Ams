import { prisma } from "../config/prisma";

export async function createNotification(
  userId: number,
  title: string,
  body: string,
  type: string,
  relatedId?: number,
  relatedType?: string
) {
  return prisma.notification.create({
    data: { userId, title, body, type, relatedId, relatedType },
  });
}

export async function notifyStudentAndParent(
  studentUserId: number,
  title: string,
  body: string,
  type: string,
  relatedId?: number,
  relatedType?: string
) {
  await createNotification(studentUserId, title, body, type, relatedId, relatedType);

  const parentLinks = await prisma.parentStudent.findMany({
    where: { studentId: studentUserId },
  });

  await Promise.all(
    parentLinks.map((pl) =>
      createNotification(pl.parentId, title, `Your ward: ${body}`, type, relatedId, relatedType)
    )
  );
}
