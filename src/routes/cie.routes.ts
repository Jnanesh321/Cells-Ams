import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { CIEController } from "../controllers/cie.controller";

const router = Router();

router.post(
  "/assignment",
  auth,
  requireRole("FACULTY"),
  asyncHandler(CIEController.upsertAssignment)
);

router.get(
  "/assignment/subject/:subjectId/:section",
  auth,
  requireRole("FACULTY", "HOD", "PRINCIPAL", "ADMIN"),
  asyncHandler(CIEController.getSubjectAssignmentMarks)
);

router.post(
  "/cie/compute/:subjectId",
  auth,
  requireRole("HOD", "FACULTY"),
  asyncHandler(CIEController.computeCIE)
);

router.get(
  "/cie/student/:usn",
  auth,
  requireRole("STUDENT", "PARENT", "FACULTY", "HOD", "PRINCIPAL", "ADMIN"),
  asyncHandler(CIEController.getStudentCIE)
);

router.get(
  "/cie/subject/:subjectId",
  auth,
  requireRole("HOD", "PRINCIPAL", "ADMIN", "EXAM_CELL"),
  asyncHandler(CIEController.getSubjectCIE)
);

router.post(
  "/cie/finalize/:subjectId",
  auth,
  requireRole("HOD"),
  asyncHandler(CIEController.finalizeCIE)
);

export default router;
