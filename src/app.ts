import express, { Application, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import attendanceRoutes from "./routes/attendance.routes";
import analyticsRoutes from "./routes/analytics.routes";
import marksRoutes from "./routes/marks.routes";
import reportRoutes from "./routes/report.routes";
import noticeRoutes from "./routes/notice.routes";
import calendarRoutes from "./routes/calendar.routes";
import academicDayRoutes from "./routes/academicDay.routes";
import timetableRoutes from "./routes/timetable.routes";
import birthdayRoutes from "./routes/birthday.routes";

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

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/marks", marksRoutes);
app.use("/reports", reportRoutes);
app.use("/notices", noticeRoutes);
app.use("/calendar", calendarRoutes);
app.use("/academic-day", academicDayRoutes);
app.use("/timetable", timetableRoutes);
app.use("/birthdays", birthdayRoutes);

/* --------------------------- 404 Handler --------------------------- */
app.use(notFound);

/* ------------------------- Global Error Handler ------------------------ */
app.use(errorHandler);

export default app;