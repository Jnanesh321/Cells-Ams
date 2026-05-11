"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
function notFound(_req, res) {
    res.status(404).json({ success: false, message: "Route not found" });
}
function errorHandler(err, _req, res, _next) {
    const status = typeof err?.status === "number" ? err.status : 500;
    const message = typeof err?.message === "string" ? err.message : "Internal Server Error";
    if (process.env.NODE_ENV !== "test") {
        // eslint-disable-next-line no-console
        console.error("Server Error:", err);
    }
    res.status(status).json({ success: false, message });
}
//# sourceMappingURL=error.js.map