"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/login", (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.login));
router.get("/me", auth_1.auth, (0, asyncHandler_1.asyncHandler)(auth_controller_1.AuthController.me));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map