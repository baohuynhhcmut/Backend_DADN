var express = require('express')
var cors = require('cors')
var app = express()
var ConnectDatabase = require("./src/config/db")
var Route = require("./src/routes/index")
require("./src/config/adafruit")
var setUpSocket = require("./src/socket_io/socket")
const http = require("http");
const LedSocket = require("./src/socket_io/led.socket")
require('dotenv').config(); // Load biến môi trường từ .env


app.use(cors())
app.use(express.json())

const server = http.createServer(app);
setUpSocket(server)
LedSocket()


// Connect to mongodb server
ConnectDatabase()

// Create app route for fetching API
Route(app)

const PORT = process.env.PORT || 8081



server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
