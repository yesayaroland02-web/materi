import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("[Socket.IO] User terhubung: ", socket.id);

    // mendengarkan pesan masuk dari client
    socket.on(
      "sendMessage",
      (data: { user: string; text: string; time: string }) => {
        console.log(`Pesan dari ${data.user}: ${data.text}`);

        // broadcast (sebarkan) pesan ke semua client yang terhubung secara real-time
        io.emit("receiveMessage", data);
      },
    );

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] User terputus: ${socket.id}`);
    });
  });

  console.log("Socket.IO server berhasil diinisialisasi");
  return io;
}