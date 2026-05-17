import { prisma } from "../config/prisma";
import { comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

export class AuthService {
  static async loginByUsn(usn: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { usn },
      select: {
        id: true,
        usn: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        departmentId: true,
        studentProfile: {
          select: {
            section: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      departmentId: user.departmentId,
    });

    const refreshToken = generateRefreshToken(user.id);

    const { passwordHash: _pw, studentProfile, ...basicUser } = user;

    return {
      accessToken,
      refreshToken,
      role: user.role,
      user: {
        ...basicUser,
        section: studentProfile?.section ?? null,
      },
    };
  }

  static async refreshAccessToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const userId = payload.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        departmentId: true,
      },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      departmentId: user.departmentId,
    });

    return { accessToken };
  }
}

