import { NextFunction, Response } from "express";
import { JwtPayload, verifyAccessToken, verifyToken } from "../utils/jwt";
import { TypedRequest } from "../types/request";
import { getSession } from "../lib/session";

export async function attachUserMiddleware(
  req: TypedRequest,
  _: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return next();
  }

  try {
    const payload: JwtPayload = verifyAccessToken(token);

    const session = await getSession(payload.sessionId);
    if (!session) return next();

    req.user = {
      id: session.userId,
      role: session.role,
    };
  } catch (error) {
    console.log("AUTH_JWT_ERROR", error);
  }

  next();
}
