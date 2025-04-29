const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     email: {
//         type:String,
//     },
//     password:{
//         type:String,
//     },
//     role:{
//         type:String,
//     },
//     phone_number:{
//         type:String,
//     },
//     address: {
//         street: { type: String },
//         city: { type: String },
//         state: { type: String },
//         country: { type: String },
//         latitude: { type: Number },
//         longitude: { type: Number }
//     }
// },{ timestamps: true })

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Đảm bảo email là duy nhất
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'USER', // Giá trị mặc định là 'USER'
    },
    phone_number: {
        type: String,
        required: true,
    },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    gardens: [{
        name: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User',userSchema)