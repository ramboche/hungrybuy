import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { JwtPayload, verifyToken } from "../utils/jwt";

export function attachUserMiddleware(
  req: AuthenticatedRequest,
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
    const payload: JwtPayload = verifyToken(token);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
  } catch (error) {
    console.log("AUTH_JWT_ERROR", error);
  }

  next();
}
