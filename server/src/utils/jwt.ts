import { Role } from "@prisma/client";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { TableContext } from "../types/request";

const ACCESS_SECRET: Secret = process.env.ACCESS_SECRET as Secret;
const ACCESS_EXPIRY: SignOptions["expiresIn"] =
  (process.env.ACCESS_EXPIRY as SignOptions["expiresIn"]) || "15m";

const REFRESH_SECRET: Secret = process.env.REFRESH_SECRET as Secret;
const REFRESH_EXPIRY: SignOptions["expiresIn"] =
  (process.env.REFRESH_EXPIRY as SignOptions["expiresIn"]) || "7d";

const TABLE_SECRET: Secret = process.env.TABLE_SECRET as Secret;
const TABLE_EXPIRY: SignOptions["expiresIn"] =
  (process.env.TABLE_EXPIRY as SignOptions["expiresIn"]) || "2h";

export type JwtPayload = {
  id: string;
  role: Role;
  sessionId: string;
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function generateTableToken(table: TableContext): string {
  return jwt.sign({ id: table.id, number: table.number }, TABLE_SECRET, {
    expiresIn: TABLE_EXPIRY,
  });
}

export function verifyTableToken(token: string): TableContext {
  return jwt.verify(token, TABLE_SECRET) as TableContext;
}
