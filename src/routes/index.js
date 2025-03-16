const userRoute = require("./user.route")
const weatherRoute = require("./weather.route")


const Route = (app) => {
    app.use('/user',userRoute)
    app.use('/weather',weatherRoute)

}

module.exports = Route;
