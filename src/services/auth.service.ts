import { prisma } from "../config/prisma";
import { comparePassword, hashPassword } from "../utils/password";
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

    let wardUsn: string | null = null;
    if (user.role === "PARENT") {
      const link = await prisma.parentStudent.findFirst({
        where: { parentId: user.id },
        select: { student: { select: { usn: true } } },
      });
      wardUsn = link?.student.usn ?? null;
    }

    return {
      accessToken,
      refreshToken,
      role: user.role,
      user: {
        ...basicUser,
        section: studentProfile?.section ?? null,
        ...(wardUsn ? { wardUsn } : {}),
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

  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }

    const ok = await comparePassword(currentPassword, user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error("Current password is incorrect"), { status: 400 });
    }

    if (newPassword.length < 6) {
      throw Object.assign(new Error("New password must be at least 6 characters"), { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true };
  }
}

