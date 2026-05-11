import { prisma } from "../config/prisma";
import { verifyPassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";

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
      },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }

    const accessToken = signAccessToken({
      sub: String(user.id),
      role: user.role,
    });

    const { passwordHash: _pw, ...basicUser } = user;

    return {
      accessToken,
      role: user.role,
      user: basicUser,
    };
  }
}

