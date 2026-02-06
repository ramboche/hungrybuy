import { Role } from "@prisma/client";
import { Request } from "express";

export interface AuthUser {
  id: string;
  role: Role;
}

export interface AuthenticatedRequest {
  user?: AuthUser;
}
