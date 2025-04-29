const userRoute = require("./user.route")
const weatherRoute = require("./weather.route")


const Route = (app) => {
    app.use('/api/v1/user',userRoute)
    app.use('/api/v1/weather',weatherRoute)

}

module.exports = Route;
