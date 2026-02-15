import { Role } from "@prisma/client";

interface AuthUser {
  id: string;
  role: Role;
}

export interface AuthenticatedRequest {
  user?: AuthUser;
}
