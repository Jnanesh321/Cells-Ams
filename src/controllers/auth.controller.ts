import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

const loginSchema = z.object({
  usn: z.string().min(1).trim(),
  password: z.string().min(1),
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

  static async me(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  }
}

