import bcrypt from "bcrypt";

export async function verifyPassword(
  plaintext: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, passwordHash);
}

