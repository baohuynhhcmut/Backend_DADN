const mongoose = require('mongoose')
const MONGO_URI = "mongodb+srv://bao2201:kMHVHlNthPcmGDBG@cluster0.xo4gu2u.mongodb.net/DADN?retryWrites=true&w=majority&appName=Cluster0"

const ConnectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('Connect to MongoDB success')
    } catch (error) {
        console.log('Fail to connect Mongodb')
    }
}

module.exports = ConnectDatabase