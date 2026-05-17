import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthService } from "../services/auth.service";

const loginSchema = z.object({
  usn: z.string().min(1).trim(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export class AuthController {
  static async login(req: Request, res: Response) {
    const { usn, password } = loginSchema.parse(req.body);
    const result = await AuthService.loginByUsn(usn, password);

    res.status(200).json({
      success: true,
      ...result,
    });
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await AuthService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      ...result,
    });
  }

  static async me(req: Request, res: Response) {
    const parentProfile = await AuthController.resolveParentProfile(req);

    res.status(200).json({
      success: true,
      user: req.user
        ? {
            ...req.user,
            parentProfile,
          }
        : null,
    });
  }

  private static async resolveParentProfile(req: Request) {
    if (!req.user || req.user.role !== "PARENT") {
      return null;
    }

    const link = await prisma.parentStudent.findFirst({
      where: { parentId: req.user.id },
      select: {
        student: {
          select: {
            usn: true,
          },
        },
      },
    });

    return {
      studentUsn: link?.student.usn ?? null,
    };
  }
}

