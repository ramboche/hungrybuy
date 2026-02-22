import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function hashPassword(plainPass: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPass, salt);
}

export async function verifyPassword(
  plainPass: string,
  hashedPass: string,
): Promise<boolean> {
  return bcrypt.compare(plainPass, hashedPass);
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
