import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth";
import { NextFunction, Response } from "express";

export function requireRole(roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(401).json({ message: "Forbidden" });
    }

    next();
  };
}
