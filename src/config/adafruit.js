const mqtt = require('mqtt');
const DataModel = require("../model/data.model")
const DeviceModel = require("../model/device.model")
const UserModel = require("../model/user.model")
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
                    unit = 'klux';
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

            global.io.emit(deviceExist.type, FeedData);

            //type: "temperature sensor", "soil moisture sensor", "light sensor"

            const newData = new DataModel({
                device_id: FeedData.device_id,
                device_name: FeedData.device_name,
                feed: FeedData.feed,
                type: FeedData.type,
                category: FeedData.category,
                value: FeedData.value,
                garden_name: FeedData.location,
                user: FeedData.user,
                timestamp: FeedData.timestamp,
                year: FeedData.year,
                month: FeedData.month,
                day: FeedData.day,
                hour: FeedData.hour
            });

            await newData.save();
            console.log(`Saved ${FeedData.device_id} with ${feed} data to DB`);
        }
    } catch (err) {
        console.error("Error handling message:", err);
    }
});
    // const messageFromFeed = message.toString()
    // switch (feed) {
    //     case "V1":
    //         const V1 = new Feed(
    //             "dev001",
    //             "Temp Sensor - Garden1_User2",
    //             feed,
    //             "temperature sensor",
    //             "sensor",
    //             { garden_name: "Garden1_User2", latitude: 10.772112, longitude: 106.657883 },
    //             "user2",
    //             parseFloat(messageFromFeed),
    //             new Date(),
    //             new Date().getFullYear(),
    //             new Date().getMonth() + 1,
    //             new Date().getDate()
    //         )
    //         console.log(V1)
    //         global.io.emit("temp",V1);
            
    //         break;
    //     // case "V3":
    //     //     const V3 = new Feed(feed,"Độ ẩm đất",messageFromFeed,"humidity_sensor","SENSOR",{ latitude: 10.772112, longitude: 106.657883,},"user2")
    //     //     console.log(V3)
    //     //     global.io.emit("humidity",V3);
    //     //     break;
    //     // case "V4":
    //     //     const V4 = new Feed(feed,"Ánh sáng",messageFromFeed,"light_sensor","SENSOR",{ latitude: 10.772112, longitude: 106.657883,},"user2")
    //     //     console.log(V4)
    //     //     global.io.emit("light",V4);
    //     //     break;
    //     default:
    //         break;
    // }


// Xử lý lỗi
client.on('error', (err) => {
    console.error('Error:', err);
});


function controlButtonV10(state){
    client.publish(`${AIO_USERNAME}/feeds/V11`,state,(err)=> {
        if(!err){
            console.log(`Sent ${state} to Adafruit IO`);
        }
    })
}

// setTimeout(() => controlButtonV10("1"), 5000);
// setTimeout(() => controlButtonV10("0"), 10000);

module.exports = {
    client,
    controlButtonV10
}