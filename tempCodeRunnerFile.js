const mongoose = require('mongoose');
const Device = require('./src/model/device.model'); // ví dụ: './models/device'

async function dropIndex() {
  await mongoose.connect('mongodb+srv://bao2201:kMHVHlNthPcmGDBG@cluster0.xo4gu2u.mongodb.net/DADN?retryWrites=true&w=majority&appName=Cluster0');

  const result = await Device.collection.dropIndex("feed_1");
  console.log("Index dropped:", result);

  await mongoose.disconnect();
}

dropIndex().catch(console.error);