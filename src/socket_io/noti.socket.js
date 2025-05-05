const Notification = require("../model/noti.model")

const userSocketMap = {};

const NotiSocket = () => {
  global.io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    // Đăng ký user với userId (cả admin và user đều gọi)
    socket.on("register", ({ email, role }) => {
      socket.userId = email;
      socket.role = role;
      userSocketMap[email] = socket.id;

      console.log(`✅ Registered ${role} with ID: ${email}`);
    });

    // Khi admin gửi thông báo
    socket.on("send_notification", async ({ senderId, receiverId, message }) => {
      // Chỉ cho phép role là admin gửi
      if (socket.role !== "ADMIN") {
        return socket.emit("error", "Chỉ admin được gửi thông báo.");
      }

      const notif = await Notification.create({ senderId, receiverId, message });

      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        global.io.to(receiverSocketId).emit("new_notification", notif);
      }

      console.log(`📨 Admin ${senderId} sent to User ${receiverId}: ${message}`);
    });

    // Ngắt kết nối
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
      if (socket.userId) {
        delete userSocketMap[socket.userId];
      }
    });
  });
};

module.exports = NotiSocket;