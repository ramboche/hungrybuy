import { getSession } from "../lib/session";
import { verifyAccessToken } from "../utils/jwt";
import { AuthenticatedSocket } from "./types";

export async function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const payload = verifyAccessToken(token);
    const session = await getSession(payload.sessionId);
    if (!session) {
      return next(new Error("Session expired"));
    }

    socket.user = {
      id: session.userId,
      role: session.role,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
}
