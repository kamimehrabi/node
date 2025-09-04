import { Server } from "socket.io";

export function setupSockets(io: Server) {
  io.on("connection", (socket) => {
    socket.on("join", (roomId: string) => {
      socket.join(roomId);
    });
  });
}

