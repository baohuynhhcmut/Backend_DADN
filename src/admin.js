const { io } = require("socket.io-client");

const socket = io("ws://localhost:8081", {
  transports: ["websocket"]
});

socket.emit("register", { email: "admin1", role: "ADMIN" });

socket.emit("send_notification", {
  senderId: "admin1",
  receiverId: "user2",
  message: "Thông báo từ admin"
});