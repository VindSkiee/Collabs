let io;

/**
 * Simpan instance io ke variabel global lokal
 */
export const initIO = async (server) => {
  const { Server } = await import("socket.io");
  io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });
  return io;
};

/**
 * Ambil instance io yang sudah diinisialisasi
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO belum diinisialisasi!");
  }
  return io;
};
