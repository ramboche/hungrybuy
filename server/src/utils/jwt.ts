import { Role } from "@prisma/client";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { TableContext } from "../types/request";

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
const EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES as SignOptions["expiresIn"]) || "7d";

const TABLE_SECRET: Secret = process.env.TABLE_SECRET as Secret;
const TABLE_EXPIRY: SignOptions["expiresIn"] =
  (process.env.TABLE_EXPIRY as SignOptions["expiresIn"]) || "2h";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export type JwtPayload = {
  id: string;
  role: Role;
};

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken<T extends object>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

export function generateTableToken(table: TableContext): string {
  return jwt.sign({ id: table.id, number: table.number }, TABLE_SECRET, {
    expiresIn: TABLE_EXPIRY,
  });
}

export function verifyTableToken(token: string): TableContext {
  return jwt.verify(token, TABLE_SECRET) as TableContext;
}
