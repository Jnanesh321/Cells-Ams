import type { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message =
    typeof err?.message === "string" ? err.message : "Internal Server Error";

  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error("Server Error:", err);
  }

  res.status(status).json({ success: false, message });
}

