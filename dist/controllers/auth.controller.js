"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const loginSchema = zod_1.z.object({
    usn: zod_1.z.string().min(1).trim(),
    password: zod_1.z.string().min(1),
});
class AuthController {
    static async login(req, res) {
        const { usn, password } = loginSchema.parse(req.body);
        const result = await auth_service_1.AuthService.loginByUsn(usn, password);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    static async me(req, res) {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map