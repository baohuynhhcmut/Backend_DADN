const socketIo = require("socket.io");

module.exports = (server) => {
    const io = socketIo(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    global.io = io;
};

