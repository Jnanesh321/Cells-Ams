import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { NoticeController } from "../controllers/notice.controller";

const router = Router();

router.get("/", auth, asyncHandler(NoticeController.list));
router.post("/", auth, requireRole("ADMIN", "HOD", "PRINCIPAL"), asyncHandler(NoticeController.create));

export default router;
