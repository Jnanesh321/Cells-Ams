import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { ReportController } from "../controllers/report.controller";

const router = Router();

router.get(
  "/student/:usn/pdf",
  auth,
  requireRole("HOD", "PRINCIPAL"),
  asyncHandler(ReportController.studentPdf)
);

router.get(
  "/class/pdf",
  auth,
  requireRole("HOD", "PRINCIPAL"),
  asyncHandler(ReportController.classPdf)
);

export default router;
