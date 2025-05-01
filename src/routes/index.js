const userRoute = require("./user.route")
const weatherRoute = require("./weather.route")
const deviceRoute = require("./device.route")
const dataRoute = require("./data.route")


const Route = (app) => {
    app.use('/api/v1/user',userRoute)
    app.use('/api/v1/weather',weatherRoute)
    app.use('/api/v1/device',deviceRoute)
    app.use('/api/v1/data',dataRoute)

}

module.exports = Route;
