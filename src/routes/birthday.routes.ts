import { Router } from "express";
import { auth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { BirthdayController } from "../controllers/birthday.controller";

const router = Router();

router.get("/today", auth, asyncHandler(BirthdayController.today));
router.get("/visibility", auth, asyncHandler(BirthdayController.getVisibility));
router.put("/visibility", auth, asyncHandler(BirthdayController.updateVisibility));

export default router;
