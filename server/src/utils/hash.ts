import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (plainPass: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPass, salt);
};

export const verifyPassword = async (
  plainPass: string,
  hashedPass: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPass, hashedPass);
};
