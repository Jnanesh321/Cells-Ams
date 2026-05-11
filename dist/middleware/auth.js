"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const prisma_1 = require("../config/prisma");
const jwt_1 = require("../utils/jwt");
function getBearerToken(req) {
    const header = req.headers.authorization;
    if (!header)
        return null;
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token)
        return null;
    return token;
}
async function auth(req, _res, next) {
    const token = getBearerToken(req);
    if (!token)
        return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
    const payload = (0, jwt_1.verifyAccessToken)(token);
    const userId = Number(payload.sub);
    if (!Number.isFinite(userId)) {
        return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            usn: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            departmentId: true,
        },
    });
    if (!user || !user.isActive) {
        return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
    }
    req.user = user;
    next();
}
//# sourceMappingURL=auth.js.map