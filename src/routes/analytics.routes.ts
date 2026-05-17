import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/college",
  auth,
  requireRole("PRINCIPAL"),
  asyncHandler(AnalyticsController.college)
);

export default router;