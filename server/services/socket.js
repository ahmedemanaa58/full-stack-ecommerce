const { Server } = require("socket.io");

let io;
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });
  io.on("connection", (socket) => {
    console.log(`DEBUG SUCCESS >> SOCKET CONNECTED ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(userId);
    });
    socket.on("disconnect", () => {
      console.log(`DEBUG SUCCESS >> SOCKET DSCONNECTED ${socket.id}`);
    });
  });
};
const getIo = () => {
  if (!io) {
    throw new Error("socket not initialized");
  }
  return io;
};
module.exports = { initSocket, getIo };
