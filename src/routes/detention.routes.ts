import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { DetentionController } from "../controllers/detention.controller";

const router = Router();

router.post(
  "/compute/:department",
  auth,
  requireRole("HOD", "ADMIN"),
  asyncHandler(DetentionController.compute)
);

router.get(
  "/list/:department",
  auth,
  requireRole("HOD", "PRINCIPAL", "ADMIN", "EXAM_CELL"),
  asyncHandler(DetentionController.list)
);

router.get(
  "/student/:usn",
  auth,
  requireRole("STUDENT", "PARENT", "HOD", "PRINCIPAL", "ADMIN"),
  asyncHandler(DetentionController.studentStatus)
);

router.post(
  "/exempt",
  auth,
  requireRole("HOD"),
  asyncHandler(DetentionController.exempt)
);

router.delete(
  "/exempt/:id",
  auth,
  requireRole("HOD"),
  asyncHandler(DetentionController.revokeExemption)
);

export default router;
