"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const error_1 = require("./middleware/error");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
/* ----------------------------- Middlewares ----------------------------- */
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN || true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/* ------------------------------- Routes -------------------------------- */
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "VCET AMS Backend Running",
        timestamp: new Date().toISOString(),
    });
});
/* Example root route */
app.get("/", (_req, res) => {
    res.json({
        app: "VCET Academic Monitoring System",
        version: "1.0.0",
        status: "API Live",
    });
});
/* Future routes */
app.use("/auth", auth_routes_1.default);
// app.use("/attendance", attendanceRoutes);
// app.use("/marks", marksRoutes);
/* --------------------------- 404 Handler --------------------------- */
app.use(error_1.notFound);
/* ------------------------- Global Error Handler ------------------------ */
app.use(error_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map