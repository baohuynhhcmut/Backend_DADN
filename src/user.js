const { io } = require("socket.io-client");

const socket = io("ws://localhost:8081", {
  transports: ["websocket"]
});

socket.emit("register", { email: "user2", role: "USER" });

socket.on("new_notification", (data) => {
  console.log("📩 Bạn nhận được thông báo:", data.message);
});