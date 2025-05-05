const { io } = require("socket.io-client");

const socket = io("ws://localhost:8081", {
  transports: ["websocket"]
});

socket.emit("openPump", "0");

