const Notification = require("../model/noti.model")

const userSocketMap = {};

const NotiSocket = () => {
  global.io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    // Đăng ký user với userId (cả admin và user đều gọi)
    socket.on("register", ({ email, role }) => {
      if (!email) {
        return socket.emit("error", "Email is required for registration");
      }
      
      socket.userId = email;
      socket.role = role;
      userSocketMap[email] = socket.id;

      console.log(`✅ Registered ${role} with ID: ${email}, socketId: ${socket.id}`);
      
      // Send list of active users to admins (useful for debugging)
      if (role === "ADMIN") {
        socket.emit("active_users", Object.keys(userSocketMap));
      }
    });

    // Khi admin gửi thông báo
    socket.on("send_notification", async ({ senderId, receiverId, message }) => {
      try {
        // Chỉ cho phép role là admin gửi
        if (socket.role !== "ADMIN") {
          return socket.emit("error", "Chỉ admin được gửi thông báo.");
        }

        console.log(`📨 Attempting to send notification from ${senderId} to ${receiverId}`);
        
        // Validate inputs
        if (!senderId || !receiverId || !message) {
          return socket.emit("error", "senderId, receiverId, and message are required");
        }

        // Create notification in database
        const notif = await Notification.create({ 
          senderId, 
          receiverId, 
          message,
          read: false 
        });

        console.log(`📝 Created notification in DB with ID: ${notif._id}`);

        // Send to the receiver if they are online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          global.io.to(receiverSocketId).emit("new_notification", notif);
          console.log(`📲 Notification sent to socket ${receiverSocketId} for user ${receiverId}`);
        } else {
          console.log(`📭 User ${receiverId} is offline, notification will be delivered when they connect`);
        }

        console.log(`✅ Admin ${senderId} sent to User ${receiverId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
        
        // Confirm to sender
        socket.emit("notification_sent", { 
          success: true, 
          notificationId: notif._id,
          receiverId 
        });
        
        // Update all admin clients with the new notification
        Object.entries(userSocketMap).forEach(([email, socketId]) => {
          // Send to all admin users and the original sender
          if (email === senderId || socket.role === "ADMIN") {
            if (socketId !== socket.id) { // Don't send to the sender's own socket
              global.io.to(socketId).emit("notification_sent_update", notif);
            }
          }
        });
      } catch (error) {
        console.error("Error sending notification:", error);
        socket.emit("error", "Failed to send notification");
      }
    });
    
    // Khi user đánh dấu thông báo đã đọc
    socket.on("mark_as_read", async ({ id, userEmail }) => {
      try {
        // Update in database
        await Notification.findByIdAndUpdate(id, { read: true });
        
        // Broadcast to all instances of the same user
        Object.entries(userSocketMap).forEach(([email, socketId]) => {
          // Broadcast to other instances of the same user
          if (email === userEmail && socketId !== socket.id) {
            global.io.to(socketId).emit("notification_read", { id });
            console.log(`📬 Notification ${id} marked as read, notifying socket ${socketId}`);
          }
          
          // Also notify admin clients
          if (socket.role === "ADMIN") {
            global.io.to(socketId).emit("notification_read_admin", { 
              id, 
              userEmail 
            });
          }
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        socket.emit("error", "Failed to mark notification as read");
      }
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