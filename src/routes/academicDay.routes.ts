import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { AcademicDayController } from "../controllers/academicDay.controller";

const router = Router();

router.get("/current", auth, asyncHandler(AcademicDayController.current));
router.get("/today", auth, asyncHandler(AcademicDayController.todaySchedule));
router.get("/today-attendance", auth, requireRole("FACULTY"), asyncHandler(AcademicDayController.todayAttendanceSession));
router.get("/overrides", auth, asyncHandler(AcademicDayController.listOverrides));
router.post("/override", auth, requireRole("ADMIN", "PRINCIPAL"), asyncHandler(AcademicDayController.setOverride));
router.post("/advance", auth, requireRole("ADMIN"), asyncHandler(AcademicDayController.advance));

export default router;
