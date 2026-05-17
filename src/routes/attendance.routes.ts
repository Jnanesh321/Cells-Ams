import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { requireClassAccess } from "../middleware/classGuard.middleware";
import { requireOwnStudentData } from "../middleware/ownership";
import { asyncHandler } from "../utils/asyncHandler";
import { AttendanceController } from "../controllers/attendance.controller";

const router = Router();

router.post(
  "/mark",
  auth,
  requireRole("FACULTY"),
  asyncHandler(requireClassAccess),
  asyncHandler(AttendanceController.mark)
);

router.put(
  "/record",
  auth,
  requireRole("FACULTY"),
  asyncHandler(requireClassAccess),
  asyncHandler(AttendanceController.updateRecord)
);

router.get("/summary/:usn", auth, asyncHandler(requireOwnStudentData), asyncHandler(AttendanceController.summary));
router.get("/student/:usn/summary", auth, asyncHandler(requireOwnStudentData), asyncHandler(AttendanceController.summary));
router.get("/session", auth, asyncHandler(AttendanceController.session));

export default router;
