import { Socket } from "socket.io";
import { Role } from "@prisma/client";

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: Role;
    sessionId: string;
  };
}
