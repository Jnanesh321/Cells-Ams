import { Router } from "express";
import { auth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { SubjectsController } from "../controllers/subjects.controller";

const router = Router();

router.get("/", auth, asyncHandler(SubjectsController.list));

export default router;
