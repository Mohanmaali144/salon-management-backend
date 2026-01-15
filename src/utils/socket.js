import { Server } from "socket.io";

let io = null; // shared instance

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",   // we can restrict this later
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

// helper to access io anywhere
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initSocket() first.");
  }
  return io;
};




// HOW TO USE
// import { getIO } from "../../utils/socket.js";

//  const io = getIO();
//   io.emit("user_created", {
//     message: "New user registered",
//     user
//   });