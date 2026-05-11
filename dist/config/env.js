"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.string().optional().default("development"),
    PORT: zod_1.z.coerce.number().int().positive().optional().default(3000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().min(1).optional().default("15m"),
    CORS_ORIGIN: zod_1.z.string().optional(),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map