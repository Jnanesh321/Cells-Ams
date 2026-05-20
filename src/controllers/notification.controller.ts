import type { Request, Response } from "express";
import { ok, fail } from "../utils/apiResponse";
import { prisma } from "../config/prisma";

export const NotificationController = {
  async list(req: Request, res: Response) {
    if (!req.user) return fail(res, "Unauthorized", 401);

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    return ok(res, { notifications, unreadCount });
  },

  async markRead(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return fail(res, "Invalid id", 400);

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return ok(res, { read: true });
  },

  async markAllRead(_req: Request, res: Response) {
    if (!_req.user) return fail(res, "Unauthorized", 401);

    const result = await prisma.notification.updateMany({
      where: { userId: _req.user.id, isRead: false },
      data: { isRead: true },
    });
    return ok(res, { read: result.count });
  },
};
