
const { controlButtonV10  } = require("../config/adafruit")

const LedSocket = () => {
    global.io.on("connection", (socket) => {
        console.log("⚡ Client connected:", socket.id);
    
        // Lắng nghe sự kiện từ client
        socket.on("openLed", (data) => {
            console.log("📩 Data received from client:", data);
            controlButtonV10(data)
        });
    
        socket.on("closeLed", (data) => {
            console.log("📩 Data received from client:", data);
            controlButtonV10(data)
        });
    
        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    });
}

module.exports = LedSocket