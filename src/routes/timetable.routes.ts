import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { TimetableController } from "../controllers/timetable.controller";

const router = Router();

router.get("/day", auth, asyncHandler(TimetableController.getDay));
router.get("/week", auth, asyncHandler(TimetableController.getWeek));
router.get("/periods", auth, asyncHandler(TimetableController.listPeriods));

router.post("/entry", auth, requireRole("ADMIN", "PRINCIPAL", "HOD"), asyncHandler(TimetableController.create));
router.post("/bulk", auth, requireRole("ADMIN", "PRINCIPAL"), asyncHandler(TimetableController.bulkCreate));
router.post("/periods", auth, requireRole("ADMIN"), asyncHandler(TimetableController.createPeriod));

router.put("/entry/:id", auth, requireRole("ADMIN", "HOD"), asyncHandler(TimetableController.update));
router.delete("/entry/:id", auth, requireRole("ADMIN", "HOD"), asyncHandler(TimetableController.remove));
router.delete("/periods/:id", auth, requireRole("ADMIN"), asyncHandler(TimetableController.removePeriod));

export default router;
