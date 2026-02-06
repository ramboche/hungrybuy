import { Role } from "@prisma/client";
import { NextFunction, Response } from "express";
import { TypedRequest } from "../types/request";

export function requireRole(roles: Role[]) {
  return (req: TypedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(401).json({ message: "Forbidden" });
    }

    next();
  };
}
