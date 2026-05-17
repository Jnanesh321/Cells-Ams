import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { AdminController } from "../controllers/admin.controller";

const router = Router();

router.use(auth, requireRole("ADMIN"));

router.post("/assign-class", asyncHandler(AdminController.assignClass));
router.delete("/assign-class/:id", asyncHandler(AdminController.removeAssignment));
router.get("/assign-class", asyncHandler(AdminController.listAssignments));

export default router;
