import { Role } from "@prisma/client";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES as SignOptions["expiresIn"]) || "7d";

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return secret as Secret;
}

export type JwtPayload = {
  id: string;
  role: Role;
};

export function signJwt(payload: JwtPayload): string {
  const secret = getJwtSecret(); 
  return jwt.sign(payload, secret, { expiresIn: EXPIRES_IN });
}

export function verifyToken<T extends object>(token: string): T {
  const secret = getJwtSecret(); 
  return jwt.verify(token, secret) as T;
}