import { Router } from "express";
import { auth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { CalendarController } from "../controllers/calendar.controller";

const router = Router();

router.get("/", auth, asyncHandler(CalendarController.list));

export default router;
