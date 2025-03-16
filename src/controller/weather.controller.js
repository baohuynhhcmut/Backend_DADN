const UserModel = require("../model/user.model")
require("dotenv").config();
const axios = require("axios");

const GetWeather = async(req, res) => {
    try {
            const { email } = req.query
            const exitUser = await UserModel.findOne({email})
            if(!exitUser){
                res.status(404).json({
                    message:'User don`t exist!'
                })
                return
            }

            const lat = exitUser.address.latitude
            const lon = exitUser.address.longitude

            if (!lat || !lon) {
                return res.status(400).json({ message: "User does not have coordinates!" });
            }
    
            // Gọi API thời tiết
            const apiKey = process.env.WEATHER_API
            const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`;
    
            const response = await axios.get(weatherUrl);
            const weatherData = response.data;
    
            // Lọc dữ liệu cần thiết
            const result = {
                temp_c: weatherData.current.temp_c,
                is_day: weatherData.current.is_day,
                main_weather: weatherData.current.condition.text,
                main_weather_icon: weatherData.current.condition.icon
            };
    
            res.status(200).json({
                status: 200,
                message: "Weather data retrieved successfully",
                data: result
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
}

module.exports = { GetWeather };