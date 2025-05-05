
const { controlButtonV10, controlButtonV11  } = require("../config/adafruit")
const Notification = require("../model/noti.model");

const userSocketMap = {};
const LedSocket = () => {
    global.io.on("connection", (socket) => {
        console.log("⚡ Client connected:", socket.id);
    
        // Lắng nghe sự kiện từ client cho máy bơm
        socket.on("openPump", (data) => {
            console.log("📩 Data received from client:", data, "from socket:", socket.id);
            controlButtonV10(String(data))
        });
    
        socket.on("closePump", (data) => {
            console.log("📩 Data received from client:", data);
            controlButtonV10(String(data))
        });
        
        
        // Lắng nghe sự kiện từ client cho đèn LED
        socket.on("openLed", (data) => {
            console.log("📩 Data received from client:", data);
            controlButtonV11(String(data))
        });
    
        socket.on("closeLed", (data) => {
            console.log("📩 Data received from client:", data);
            controlButtonV11(String(data))
        });

        socket.on("register", ({ email, role }) => {
            socket.userId = email;
            socket.role = role;
            userSocketMap[email] = socket.id;
      
            console.log(`✅ Registered ${role} with ID: ${email}`);
          });
      
          socket.on("send_notification", async ({ senderId, receiverId, message }) => {
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
    
        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    });
}

module.exports = LedSocket