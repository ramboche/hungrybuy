import { Server } from "socket.io";
import { socketAuthMiddleware } from "./auth.socket";
import { AuthenticatedSocket } from "./types";

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL!, process.env.ADMIN_URL!],
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log("socket connected:", socket.id, socket.user);
    
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
}
