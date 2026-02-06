import { NextFunction, Response } from "express";
import { JwtPayload, verifyToken } from "../utils/jwt";
import { TypedRequest } from "../types/request";

export function attachUserMiddleware(
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
