const mqtt = require('mqtt');
const DataModel = require("../model/data.model")
const DeviceModel = require("../model/device.model")
const UserModel = require("../model/user.model")
const SessionModel = require('../model/session.model')
const { sendEmail } = require("../config/email")

const AIO_USERNAME = process.env.AIO_USERNAME;
const AIO_KEY = process.env.AIO_KEY;
const FEED_NAME = [
    "V1",
    "V2",
    "V3",
    "V4",
    "V10",
    "V11"
];

// V1: Nhiệt độ
// V2: Độ ẩm không khí
// V3: Độ ẩm đất
// V4: Độ ẩm không khí
// V10: Máy bơm
// V11: Đèn LED

// {
// 	"device_id": "dev001",
// 	"device_name": "Temp Sensor - Garden1_User2",
// 	"feed": "V1",
//   	"type": "temperature sensor",
//   	"category": "sensor",
//   	"location": {
//     		"garden_name": "Garden1_User2",
//     		"latitude": 10.772112,
//     		"longitude": 106.657883
//   	},
//   	"user": "user2",
// 	"value": 25.5,
// 	"timestamp": "2025-04-01T07:00:00Z",
// 	"year": 2025,
// 	"month": 5,
// 	"day": 1,
// }

class Feed {
    constructor(device_id, device_name, feed, type, category, location, user, value, timestamp, year, month, day, hour) {
        this.device_id = device_id;
        this.device_name = device_name;
        this.feed = feed;
        this.type = type;
        this.category = category;
        this.location = location;
        this.user = user;
        this.value = value || null;
        this.timestamp = timestamp || new Date();
        this.year = year || new Date().getFullYear();
        this.month = month || new Date().getMonth() + 1;
        this.day = day || new Date().getDate();
        this.hour = hour || new Date().getHours();
    }
}

const MQTT_BROKER = `mqtts://${AIO_USERNAME}:${AIO_KEY}@io.adafruit.com`;

const client = mqtt.connect(MQTT_BROKER);


client.on('connect', () => {
    console.log('Connected to Adafruit IO');

    // Đăng ký nhận dữ liệu từ feed
    for(const feed of FEED_NAME){
        client.subscribe(`${AIO_USERNAME}/feeds/${feed}`);
    }
});

// {
// 	"device_id": "dev001",
// 	"device_name": "Temp Sensor - Garden1_User2",
// 	"feed": "V1",
//   	"type": "temperature sensor",
//   	"category": "sensor",
//   	"location": {
//     		"garden_name": "Garden1_User2",
//     		"latitude": 10.772112,
//     		"longitude": 106.657883
//   	},
//   	"user": "user2",
// 	"value": 25.5,
// 	"timestamp": "2025-04-01T07:00:00Z",
// 	"year": 2025,
// 	"month": 5,
// 	"day": 1,
// }

client.on('message', async (topic, message) => {
    const feed = topic.split("/").pop();
    console.log(`Received message from ${feed}:`, topic, message.toString());
    
    try {
        // Check if the message is from control devices (V10 or V11)
        if (feed === "V10" || feed === "V11") {
            const deviceName = feed === "V10" ? "Pump" : "LED";
            const action = message.toString() === "1" ? "turned ON" : "turned OFF";
            const isTimerExecution = message.toString() === "0" && feed in global.activeTimers;
            
            // Emit control acknowledgment to all connected clients
            global.io.emit('control_ack', {
                feed: feed,
                value: message.toString(),
                status: "success",
                message: `${deviceName} successfully ${action}${isTimerExecution ? ' by timer' : ''}`,
                timestamp: new Date(),
                byTimer: isTimerExecution
            });
            console.log(`Emitted control acknowledgment for ${feed} with value ${message.toString()}`);
        }

        // Handle sensor data for automatic control
        if (feed === "V1") { // Temperature sensor
            const temperatureValue = parseFloat(message.toString());
            console.log(`🌡️ Temperature reading: ${temperatureValue}°C`);
            
            // Check pump (V10) automatic mode settings
            if (global.deviceModes && global.deviceModes.V10 && global.deviceModes.V10.mode === 'automatic') {
                const pumpConfig = global.deviceModes.V10;
                
                // Temperature outside thresholds (above upper or below lower) - turn ON pump
                if (temperatureValue > pumpConfig.upperThreshold || temperatureValue < pumpConfig.lowerThreshold) {
                    console.log(`🔄 AUTOMATIC: Temperature (${temperatureValue}°C) outside thresholds (${pumpConfig.lowerThreshold}°C-${pumpConfig.upperThreshold}°C) - turning ON pump`);
                    controlButtonV10("1");
                } 
                // Temperature within thresholds - turn OFF pump
                else if (temperatureValue >= pumpConfig.lowerThreshold && temperatureValue <= pumpConfig.upperThreshold) {
                    console.log(`🔄 AUTOMATIC: Temperature (${temperatureValue}°C) within thresholds (${pumpConfig.lowerThreshold}°C-${pumpConfig.upperThreshold}°C) - turning OFF pump`);
                    controlButtonV10("0");
                }
            }
        }
        
        if (feed === "V4") { // Light sensor
            const lightValue = parseFloat(message.toString());
            console.log(`💡 Light reading: ${lightValue} lux`);
            
            // Check LED (V11) automatic mode settings
            if (global.deviceModes && global.deviceModes.V11 && global.deviceModes.V11.mode === 'automatic') {
                const ledConfig = global.deviceModes.V11;
                
                // Light below lower threshold - turn ON LED
                if (lightValue < ledConfig.lowerThreshold) {
                    console.log(`🔄 AUTOMATIC: Light (${lightValue} lux) below threshold (${ledConfig.lowerThreshold} lux) - turning ON LED`);
                    controlButtonV11("1");
                }
                // Light within or above thresholds - turn OFF LED
                else if (lightValue >= ledConfig.lowerThreshold) {
                    console.log(`🔄 AUTOMATIC: Light (${lightValue} lux) above or within threshold (${ledConfig.lowerThreshold} lux) - turning OFF LED`);
                    controlButtonV11("0");
                }
            }
        }

        const deviceListExist = await DeviceModel.find({ feed: feed });
        if (deviceListExist.length === 0) {
            console.log("No device found with feed:", feed);
            return;
        }
        for (const deviceExist of deviceListExist) {
            if (deviceExist.is_active === false) {
                console.log("Device is inactive:", deviceExist.device_id);
                continue;
            }
            if (deviceExist.user === null || deviceExist.user === undefined || deviceExist.location === null || deviceExist.location === undefined) {
                console.log("Device user or location is null:", deviceExist.device_id);
                continue;
            }
            
            const userExist = await UserModel.findOne({ email: deviceExist.user });

            if (parseFloat(message.toString()) > deviceExist.threshold.max || parseFloat(message.toString()) < deviceExist.threshold.min) { 
                let index, unit;
                if (deviceExist.type === "temperature sensor") {
                    index = 'Nhiệt độ';
                    unit = '°C';
                } else if (deviceExist.type === "soil moisture sensor") {
                    index = 'Độ ẩm đất';
                    unit = '%';
                } else if (deviceExist.type === "light sensor") {
                    index = 'Độ sáng';
                    unit = 'lux';
                }
                const emailSubject = "Cảnh báo: Thông số vượt ngưỡng trong khu vườn của bạn";
                const emailHtml = `
                    <html>
                        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: rgb(255, 174, 174);">
                            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <h2 style="color: #333;">Xin chào, ${userExist.name}!</h2>
                                <p style="color: #555;">Thông số <strong>${index}</strong> trong khu vườn <strong>${deviceExist.location.garden_name}</strong> của bạn đã vượt qua ngưỡng cho phép!</p>
                                <p style="color: #555;">Giới hạn tối thiểu là <strong>${deviceExist.threshold.min}${unit}</strong> và tối đa là <strong>${deviceExist.threshold.max}${unit}</strong>. Hiện tại, thông số của bạn đang là <strong>${message}${unit}</strong>.</p>
                                <p style="color: #555;">Vui lòng kiểm tra và điều chỉnh thiết bị để đảm bảo khu vườn của bạn hoạt động bình thường.</p>
                                <p style="color: #555;">Nếu bạn cần trợ giúp, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
                                <p style="color: #555;">Trân trọng,<br>Đội ngũ hỗ trợ Hệ thống Nông Trại Thông Minh</p>
                            </div>
                        </body>
                    </html>
                `;
            
                if (/^[\w.+-]+@gmail\.com$/.test(deviceExist.user)) {
                    const email = deviceExist.user;
                    try {
                        await sendEmail(email, emailSubject, emailHtml);
                        console.log("Email sent successfully!");
                    } catch (error) {
                        console.log("Error sending email:", error);
                    }
                }
            }
            const FeedData = new Feed(
                deviceExist.device_id,
                deviceExist.device_name,
                feed,
                deviceExist.type,
                deviceExist.category,
                deviceExist.location.garden_name,
                deviceExist.user,
                parseFloat(message.toString()),
                new Date(),
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                new Date().getDate(),
                new Date().getHours()
            );


            //type: "temperature sensor", "soil moisture sensor", "light sensor"

            if (deviceExist.type === "temperature sensor" || deviceExist.type === "soil moisture sensor" || deviceExist.type === "light sensor") {
                global.io.emit(deviceExist.type, FeedData);
                const data = new DataModel({
                    device_id: deviceExist.device_id,
                    device_name: deviceExist.device_name,
                    feed: feed,
                    type: deviceExist.type,
                    category: deviceExist.category,
                    garden_name: deviceExist.location.garden_name,
                    user: deviceExist.user,
                    value: parseFloat(message.toString()),
                    timestamp: new Date(),
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                    day: new Date().getDate(),
                    hour: new Date().getHours()
                });
                await data.save();
                console.log(`Saved ${FeedData.device_id} with ${feed} data to DB`);
            } else {
                const statusValue = message.toString() === "1" ? "on" : "off";
                await DeviceModel.updateOne(
                    { _id: deviceExist._id },
                    { $set: { status: statusValue } }
                );
                const sessionEntry = {
                    device_id: deviceExist.device_id,
                    action: message.toString() === "1" ? "Turn on" : "Turn off",
                    by: deviceExist.mode === 'manual' ? "user" : "automatic system",
                    timestamp: new Date()
                };
                const result = await SessionModel.create(sessionEntry);
                console.log("✅ Session entry saved:", result);
            }
        }
    } catch (err) {
        console.error("Error handling message:", err);
    }
});

// Xử lý lỗi
client.on('error', (err) => {
    console.error('Error:', err);
});

// Hàm điều khiển máy bơm
function controlButtonV10(state){
    console.log(`Attempting to control Pump (V10) with state: ${state}`);
    
    // Validate state
    if (state !== "0" && state !== "1") {
        console.error(`❌ Invalid state for Pump (V10): ${state}. Must be "0" or "1"`);
        global.io.emit('control_error', {
            feed: 'V10',
            error: 'Invalid state value. Must be "0" or "1"'
        });
        return;
    }
    
    client.publish(`${AIO_USERNAME}/feeds/V10`, state, (err) => {
        if(!err){
            console.log(`✅ Sent ${state} to Adafruit IO - Pump (V10)`);
            // We don't emit control_ack here because we'll get the message back from Adafruit
            // through the MQTT subscription, and then emit the control_ack
        } else {
            console.error(`❌ Error sending ${state} to Adafruit IO - Pump (V10):`, err);
            // Notify client about the error
            global.io.emit('control_error', {
                feed: 'V10',
                error: 'Failed to send command to device',
                details: err.message
            });
        }
    });
}

// Hàm điều khiển đèn LED
function controlButtonV11(state){
    console.log(`Attempting to control LED (V11) with state: ${state}`);
    
    // Validate state
    if (state !== "0" && state !== "1") {
        console.error(`❌ Invalid state for LED (V11): ${state}. Must be "0" or "1"`);
        global.io.emit('control_error', {
            feed: 'V11',
            error: 'Invalid state value. Must be "0" or "1"'
        });
        return;
    }
    
    client.publish(`${AIO_USERNAME}/feeds/V11`, state, (err) => {
        if(!err){
            console.log(`✅ Sent ${state} to Adafruit IO - LED (V11)`);
            // We don't emit control_ack here because we'll get the message back from Adafruit
            // through the MQTT subscription, and then emit the control_ack
        } else {
            console.error(`❌ Error sending ${state} to Adafruit IO - LED (V11):`, err);
            // Notify client about the error
            global.io.emit('control_error', {
                feed: 'V11',
                error: 'Failed to send command to device',
                details: err.message
            });
        }
    });
}

// setTimeout(() => controlButtonV10("1"), 5000);
// setTimeout(() => controlButtonV10("0"), 10000);

module.exports = {
    client,
    controlButtonV10,
    controlButtonV11
}