import express, { Application, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

/* ----------------------------- Middlewares ----------------------------- */
app.use(
  cors({
    origin: env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------------------- Routes -------------------------------- */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "VCET AMS Backend Running",
    timestamp: new Date().toISOString(),
  });
});

/* Example root route */
app.get("/", (_req: Request, res: Response) => {
  res.json({
    app: "VCET Academic Monitoring System",
    version: "1.0.0",
    status: "API Live",
  });
});

/* Future routes */
app.use("/auth", authRoutes);
// app.use("/attendance", attendanceRoutes);
// app.use("/marks", marksRoutes);

/* --------------------------- 404 Handler --------------------------- */
app.use(notFound);

/* ------------------------- Global Error Handler ------------------------ */
app.use(errorHandler);

export default app;