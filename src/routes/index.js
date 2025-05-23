const userRoute = require("./user.route")
const weatherRoute = require("./weather.route")
const deviceRoute = require("./device.route")
const dataRoute = require("./data.route")
const configRoute = require("./config.route") // Đường dẫn cho config.route.js
const sessionRoute = require("./session.route") // Đường dẫn cho session.route.js
const notiRoute = require("./noti.route") // Đường dẫn cho noti.route.js


const Route = (app) => {
    app.use('/api/v1/user',userRoute)
    app.use('/api/v1/weather',weatherRoute)
    app.use('/api/v1/device',deviceRoute)
    app.use('/api/v1/data',dataRoute)
    app.use('/api/v1/config',configRoute) // Đường dẫn cho config.route.js
    app.use('/api/v1/session',sessionRoute) // Đường dẫn cho session.route.js
    app.use('/api/v1/noti',notiRoute) // Đường dẫn cho noti.route.js

}

module.exports = Route;
