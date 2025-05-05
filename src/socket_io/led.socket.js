const { controlButtonV10, controlButtonV11 } = require("../config/adafruit")

// Store active timers with device ID as key
const activeTimers = {};
// Make activeTimers globally accessible
global.activeTimers = activeTimers;

// Store device modes and thresholds
const deviceModes = {
    'V10': {
        mode: 'manual',
        upperThreshold: 33,
        lowerThreshold: 33
    },
    'V11': {
        mode: 'manual',
        upperThreshold: 2000,
        lowerThreshold: 2000
    }
};
// Make deviceModes globally accessible
global.deviceModes = deviceModes;
const { controlButtonV10, controlButtonV11  } = require("../config/adafruit")
const Notification = require("../model/noti.model");

const userSocketMap = {};
const LedSocket = () => {
    global.io.on("connection", (socket) => {
        console.log("⚡ Client connected:", socket.id);
    
        // Listen for "control_error" event from Adafruit and forward to client
        socket.on("control_error", (data) => {
            socket.emit("control_error", data);
        });
        
        // Listen for automatic mode setting
        socket.on("setAutomaticMode", (data) => {
            console.log("📩 Received automatic mode request:", data);
            
            try {
                const { deviceId, mode, upperThreshold, lowerThreshold } = data;
                
                if (!deviceId || !mode) {
                    socket.emit("control_error", {
                        deviceId,
                        error: "Missing required parameters"
                    });
                    return;
                }
                
                // Update device mode
                if (!deviceModes[deviceId]) {
                    deviceModes[deviceId] = { mode: 'manual' };
                }
                
                deviceModes[deviceId].mode = mode;
                
                // Update thresholds if provided
                if (mode === 'automatic' && upperThreshold !== undefined && lowerThreshold !== undefined) {
                    deviceModes[deviceId].upperThreshold = upperThreshold;
                    deviceModes[deviceId].lowerThreshold = lowerThreshold;
                }
                
                // Acknowledge mode change
                socket.emit("automatic_mode_set", {
                    deviceId,
                    mode,
                    upperThreshold: deviceModes[deviceId].upperThreshold,
                    lowerThreshold: deviceModes[deviceId].lowerThreshold
                });
                
                console.log(`🤖 Device ${deviceId} set to ${mode} mode`);
            } catch (error) {
                console.error("❌ Error setting automatic mode:", error);
                socket.emit("control_error", {
                    error: "Failed to set automatic mode",
                    details: error.message
                });
            }
        });
        
        // Listen for threshold updates
        socket.on("updateThresholds", (data) => {
            console.log("📩 Received threshold update request:", data);
            
            try {
                const { deviceId, upperThreshold, lowerThreshold } = data;
                
                if (!deviceId || upperThreshold === undefined || lowerThreshold === undefined) {
                    socket.emit("control_error", {
                        deviceId,
                        error: "Missing required parameters for threshold update"
                    });
                    return;
                }
                
                // Ensure device exists in mode map
                if (!deviceModes[deviceId]) {
                    deviceModes[deviceId] = { mode: 'manual' };
                }
                
                // Update thresholds
                deviceModes[deviceId].upperThreshold = upperThreshold;
                deviceModes[deviceId].lowerThreshold = lowerThreshold;
                
                // Acknowledge update
                socket.emit("thresholds_updated", {
                    deviceId,
                    upperThreshold,
                    lowerThreshold
                });
                
                console.log(`📊 Updated thresholds for ${deviceId}: upper=${upperThreshold}, lower=${lowerThreshold}`);
            } catch (error) {
                console.error("❌ Error updating thresholds:", error);
                socket.emit("control_error", {
                    error: "Failed to update thresholds",
                    details: error.message
                });
            }
        });
        
        // Listen for timer set event
        socket.on("setTimer", (data) => {
            console.log("📩 Received timer set request:", data);
            
            try {
                const { deviceId, turnOffTime } = data;
                
                // Clear any existing timer for this device
                if (activeTimers[deviceId]) {
                    clearTimeout(activeTimers[deviceId]);
                    delete activeTimers[deviceId];
                }
                
                // Calculate time until turn off
                const turnOffDate = new Date(turnOffTime);
                const now = new Date();
                const timeUntilTurnOff = turnOffDate.getTime() - now.getTime();
                
                if (timeUntilTurnOff <= 0) {
                    socket.emit("timer_error", {
                        deviceId,
                        error: "Turn off time must be in the future"
                    });
                    return;
                }
                
                // Set a timer to turn off the device
                activeTimers[deviceId] = setTimeout(() => {
                    console.log(`⏰ Timer executed for ${deviceId}`);
                    
                    // Turn off the device based on ID
                    if (deviceId === 'V10') {
                        controlButtonV10("0");
                    } else if (deviceId === 'V11') {
                        controlButtonV11("0");
                    }
                    
                    // Remove the timer reference
                    delete activeTimers[deviceId];
                    
                    // Notify the client that the timer was executed
                    global.io.emit("timer_executed", {
                        deviceId,
                        executeTime: new Date()
                    });
                }, timeUntilTurnOff);
                
                socket.emit("timer_set", {
                    deviceId,
                    turnOffTime,
                    timeUntilTurnOff
                });
                
                console.log(`⏰ Timer set for ${deviceId} to turn off at ${turnOffTime} (in ${timeUntilTurnOff}ms)`);
            } catch (error) {
                console.error("❌ Error setting timer:", error);
                socket.emit("timer_error", {
                    error: "Failed to set timer",
                    details: error.message
                });
            }
        });
        
        // Listen for timer cancel event
        socket.on("cancelTimer", (data) => {
            console.log("📩 Received timer cancel request:", data);
            
            try {
                const { deviceId } = data;
                
                if (activeTimers[deviceId]) {
                    clearTimeout(activeTimers[deviceId]);
                    delete activeTimers[deviceId];
                    
                    socket.emit("timer_cancelled", {
                        deviceId,
                        cancelTime: new Date()
                    });
                    
                    console.log(`⏰ Timer cancelled for ${deviceId}`);
                } else {
                    // No active timer found, but don't treat this as an error
                    // Just acknowledge that no timer needed to be cancelled
                    socket.emit("timer_cancelled", {
                        deviceId,
                        cancelTime: new Date(),
                        message: "No active timer was running"
                    });
                    
                    console.log(`⏰ No active timer to cancel for ${deviceId}`);
                }
            } catch (error) {
                console.error("❌ Error cancelling timer:", error);
                socket.emit("timer_error", {
                    error: "Failed to cancel timer",
                    details: error.message
                });
            }
        });
    
        // Lắng nghe sự kiện từ client cho máy bơm
        socket.on("openPump", (data) => {
            console.log("📩 Received request to OPEN pump:", data, "from socket:", socket.id);
            try {
                // Luôn gửi "1" để bật máy bơm
                controlButtonV10("1");
                
                // Acknowledge receipt of command (not the actual operation result)
                socket.emit("command_received", {
                    feed: "V10",
                    command: "open",
                    status: "processing"
                });
            } catch (error) {
                console.error("❌ Error controlling pump:", error);
                socket.emit("control_error", {
                    feed: "V10",
                    error: "Failed to control pump"
                });
            }
        });
    
        socket.on("closePump", (data) => {
            console.log("📩 Received request to CLOSE pump:", data, "from socket:", socket.id);
            try {
                // Luôn gửi "0" để tắt máy bơm
                controlButtonV10("0");
                
                // Cancel any active timer for this device
                if (activeTimers['V10']) {
                    clearTimeout(activeTimers['V10']);
                    delete activeTimers['V10'];
                    console.log("⏰ Timer cancelled for V10 due to manual turn off");
                }
                
                // Acknowledge receipt of command (not the actual operation result)
                socket.emit("command_received", {
                    feed: "V10",
                    command: "close",
                    status: "processing"
                });
            } catch (error) {
                console.error("❌ Error controlling pump:", error);
                socket.emit("control_error", {
                    feed: "V10",
                    error: "Failed to control pump"
                });
            }
        });
        
        
        // Lắng nghe sự kiện từ client cho đèn LED
        socket.on("openLed", (data) => {
            console.log("📩 Received request to OPEN LED:", data, "from socket:", socket.id);
            try {
                // Luôn gửi "1" để bật đèn LED
                controlButtonV11("1");
                
                // Acknowledge receipt of command (not the actual operation result)
                socket.emit("command_received", {
                    feed: "V11",
                    command: "open",
                    status: "processing"
                });
            } catch (error) {
                console.error("❌ Error controlling LED:", error);
                socket.emit("control_error", {
                    feed: "V11",
                    error: "Failed to control LED"
                });
            }
        });
    
        socket.on("closeLed", (data) => {
            console.log("📩 Received request to CLOSE LED:", data, "from socket:", socket.id);
            try {
                // Luôn gửi "0" để tắt đèn LED
                controlButtonV11("0");
                
                // Cancel any active timer for this device
                if (activeTimers['V11']) {
                    clearTimeout(activeTimers['V11']);
                    delete activeTimers['V11'];
                    console.log("⏰ Timer cancelled for V11 due to manual turn off");
                }
                
                // Acknowledge receipt of command (not the actual operation result)
                socket.emit("command_received", {
                    feed: "V11",
                    command: "close",
                    status: "processing"
                });
            } catch (error) {
                console.error("❌ Error controlling LED:", error);
                socket.emit("control_error", {
                    feed: "V11",
                    error: "Failed to control LED"
                });
            }
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