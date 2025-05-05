
const { controlButtonV10, controlButtonV11  } = require("../config/adafruit")

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
    
        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    });
}

module.exports = LedSocket