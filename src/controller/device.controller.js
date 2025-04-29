const DeviceModel = require("../model/device.model")

const getDeviceByUser = async (req, res) => {
    try {
        const { user } = req.query;
        const devices = await DeviceModel.find({ user: user });
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    getDeviceByUser,
}