import { Role } from "@prisma/client";

interface AuthUser {
  id: string;
  role: Role;
  restaurantId?: string;
}

export interface AuthenticatedRequest {
  user?: AuthUser;
}
