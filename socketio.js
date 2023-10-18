let io;
module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        methods: ["GET", "POST"],
      },
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("IO not authenticated");
    }
    return io;
  },
};
