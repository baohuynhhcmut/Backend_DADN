const mqtt = require('mqtt');

const AIO_USERNAME = 'khanhtruong';
const AIO_KEY = 'aio_Ugps08cqAHkg71u8xqkDEiBS5RHR';
const FEED_NAME = [
    "V1",
    "V2",
    "V3",
    "V4",
    "V10",
    "V11"
];

class Feed {
    constructor(feed,name,value,type,category,location,user){
        this.feed = feed
        this.name = name
        this.value = value,
        this.type = type,
        this.category = category,
        this.location = location,
        this.user = user
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

client.on('message', (topic, message) => {
    const feed = topic.split("/").pop();
    const messageFromFeed = message.toString()
    switch (feed) {
        case "V1":
            const V1 = new Feed(feed,"Nhiệt độ",messageFromFeed,"temperature_sensor","SENSOR",{ latitude: 10.772112, longitude: 106.657883,},"user2")
            console.log(V1)
            global.io.emit("temp",V1);
            break;
        case "V3":
            const V3 = new Feed(feed,"Độ ẩm đất",messageFromFeed,"humidity_sensor","SENSOR",{ latitude: 10.772112, longitude: 106.657883,},"user2")
            console.log(V3)
            global.io.emit("humidity",V3);
            break;
        case "V4":
            const V4 = new Feed(feed,"Ánh sáng",messageFromFeed,"light_sensor","SENSOR",{ latitude: 10.772112, longitude: 106.657883,},"user2")
            console.log(V4)
            global.io.emit("light",V4);
            break;
        default:
            break;
    }
});

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