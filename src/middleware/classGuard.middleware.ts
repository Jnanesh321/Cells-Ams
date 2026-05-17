import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

function parseNumber(input: unknown): number | null {
  const value = typeof input === "string" ? Number(input) : Number(input ?? NaN);
  if (!Number.isFinite(value)) return null;
  return value;
}

function pickSubjectId(req: Request): number | null {
  return (
    parseNumber(req.body?.subjectId) ??
    parseNumber(req.params?.subjectId) ??
    parseNumber(req.query?.subjectId)
  );
}

function pickSection(req: Request): string | null {
  const bodySection = typeof req.body?.section === "string" ? req.body.section.trim() : "";
  const paramSection = typeof req.params?.section === "string" ? req.params.section.trim() : "";
  const querySection = typeof req.query?.section === "string" ? req.query.section.trim() : "";

  return bodySection || paramSection || querySection || null;
}

export async function requireClassAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }

  const subjectId = pickSubjectId(req);
  const section = pickSection(req);

  if (!subjectId || !section) {
    return res.status(400).json({
      success: false,
      data: null,
      error: "subjectId and section are required",
    });
  }

  const facultyProfile = await prisma.facultyProfile.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });

  if (!facultyProfile) {
    return res.status(403).json({
      success: false,
      data: null,
      error: "You are not assigned to this class",
    });
  }

  const assignment = await prisma.classAssignment.findFirst({
    where: {
      facultyProfileId: facultyProfile.id,
      subjectId,
      section,
      isActive: true,
    },
    select: { id: true },
  });

  if (!assignment) {
    return res.status(403).json({
      success: false,
      data: null,
      error: "You are not assigned to this class",
    });
  }

  next();
}
