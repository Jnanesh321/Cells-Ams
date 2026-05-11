"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN,
    });
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
    if (typeof decoded !== "object" || decoded === null) {
        throw Object.assign(new Error("Invalid token payload"), { status: 401 });
    }
    const { sub, role } = decoded;
    if (!sub || !role) {
        throw Object.assign(new Error("Invalid token payload"), { status: 401 });
    }
    return { sub, role };
}
//# sourceMappingURL=jwt.js.map