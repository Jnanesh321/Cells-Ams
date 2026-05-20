import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/login", asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));
router.get("/me", auth, asyncHandler(AuthController.me));
router.post("/change-password", auth, asyncHandler(AuthController.changePassword));

export default router;

