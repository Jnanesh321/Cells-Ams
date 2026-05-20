import { Router } from "express";
import { auth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

router.get(
  "/",
  auth,
  asyncHandler(NotificationController.list)
);

router.post(
  "/read/:id",
  auth,
  asyncHandler(NotificationController.markRead)
);

router.post(
  "/read-all",
  auth,
  asyncHandler(NotificationController.markAllRead)
);

export default router;
