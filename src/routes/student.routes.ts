import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { requireOwnStudentData } from "../middleware/ownership";
import { asyncHandler } from "../utils/asyncHandler";
import { StudentController } from "../controllers/student.controller";

const router = Router();

router.get(
  "/profile/:usn",
  auth,
  requireRole("STUDENT", "PARENT", "FACULTY", "HOD", "PRINCIPAL", "ADMIN"),
  asyncHandler(requireOwnStudentData),
  asyncHandler(StudentController.getProfile)
);

router.put(
  "/profile",
  auth,
  requireRole("STUDENT"),
  asyncHandler(StudentController.updateProfile)
);

export default router;
