const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type:String,
    },
    password:{
        type:String,
    },
    role:{
        type:String,
    },
    phone_number:{
        type:String,
    },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    }
},{ timestamps: true })

module.exports = mongoose.model('User',userSchema)