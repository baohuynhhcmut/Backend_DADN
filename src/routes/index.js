const userRoute = require("./user.route")
const weatherRoute = require("./weather.route")
const deviceRoute = require("./device.route")


const Route = (app) => {
    app.use('/api/v1/user',userRoute)
    app.use('/api/v1/weather',weatherRoute)
    app.use('/api/v1/device',deviceRoute)

}

module.exports = Route;
