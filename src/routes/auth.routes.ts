import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/login", asyncHandler(AuthController.login));
router.get("/me", auth, asyncHandler(AuthController.me));

export default router;

