"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async loginByUsn(usn, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { usn },
            select: {
                id: true,
                usn: true,
                name: true,
                email: true,
                passwordHash: true,
                role: true,
                isActive: true,
                departmentId: true,
            },
        });
        if (!user || !user.isActive) {
            throw Object.assign(new Error("Invalid credentials"), { status: 401 });
        }
        const ok = await (0, password_1.verifyPassword)(password, user.passwordHash);
        if (!ok) {
            throw Object.assign(new Error("Invalid credentials"), { status: 401 });
        }
        const accessToken = (0, jwt_1.signAccessToken)({
            sub: String(user.id),
            role: user.role,
        });
        const { passwordHash: _pw, ...basicUser } = user;
        return {
            accessToken,
            role: user.role,
            user: basicUser,
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map