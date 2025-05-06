const socketIo = require("socket.io");

module.exports = (server) => {
    const corsOrigin = process.env.CORS_ORIGIN || "*";
    
    const io = socketIo(server, {
        cors: { 
            origin: corsOrigin, 
            methods: ["GET", "POST"] 
        }
    });

    global.io = io;
};

