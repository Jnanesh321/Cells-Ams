import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { requireClassAccess } from "../middleware/classGuard.middleware";
import { requireOwnStudentData } from "../middleware/ownership";
import { asyncHandler } from "../utils/asyncHandler";
import { MarksController } from "../controllers/marks.controller";

const router = Router();

router.post(
  "/ia",
  auth,
  requireRole("FACULTY"),
  asyncHandler(requireClassAccess),
  asyncHandler(MarksController.upsertIA)
);

router.get(
  "/student/:usn",
  auth,
  requireRole("STUDENT", "PARENT", "FACULTY", "HOD", "PRINCIPAL"),
  asyncHandler(requireOwnStudentData),
  asyncHandler(MarksController.studentMarks)
);

router.get(
  "/dept/:deptId",
  auth,
  requireRole("HOD", "PRINCIPAL"),
  asyncHandler(MarksController.deptMarks)
);

// =========== VTU IA Routes ===========

router.post(
  "/vtu/ia",
  auth,
  requireRole("FACULTY"),
  asyncHandler(MarksController.upsertVTUIA)
);

router.get(
  "/vtu/student/:usn",
  auth,
  requireRole("STUDENT", "PARENT", "FACULTY", "HOD", "PRINCIPAL"),
  asyncHandler(requireOwnStudentData),
  asyncHandler(MarksController.studentVTUIA)
);

router.get(
  "/vtu/cie/:usn",
  auth,
  requireRole("STUDENT", "PARENT", "FACULTY", "HOD", "PRINCIPAL"),
  asyncHandler(requireOwnStudentData),
  asyncHandler(MarksController.studentVTUCIE)
);

router.post(
  "/vtu/compute-cie",
  auth,
  requireRole("FACULTY", "HOD"),
  asyncHandler(MarksController.computeVTUCIE)
);

export default router;
