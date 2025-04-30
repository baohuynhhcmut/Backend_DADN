const DeviceModel = require("../model/device.model")

const getDeviceByUser = async (req, res) => {
    try {
        const { email } = req.query;
        const devices = await DeviceModel.find({ user: email });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this user" });
        }       
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getDeviceByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const devices = await DeviceModel.find({ category });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this category" });
        }
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getDeviceByUserAndCategory = async (req, res) => {
    try {
        const { email, category } = req.query;
        const devices = await DeviceModel.find({ user: email, category });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this user and category" });
        }
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getDeviceByUserAndType = async (req, res) => {
    try {
        const { email, type } = req.query;
        const devices = await DeviceModel.find({ user: email, type });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this user and type" });
        }
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getDeviceByLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        const devices = await DeviceModel.find({ "location.latitude": latitude, "location.longitude": longitude });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this location" });
        }
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getDeviceByGardenName = async (req, res) => {
    try {
        const { garden_name } = req.query;
        const devices = await DeviceModel.find({ "location.garden_name": garden_name });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this garden name" });
        }
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
const getDeviceByType = async (req, res) => {
    try {
        const { type } = req.query;
        const devices = await DeviceModel.find({ type });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this type" });
        }
        res.status(200).json({
            status:200,
            message:'Find devices successfully',
            data: devices
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getDeviceByIsActive = async (req, res) => {
    try {
        const { is_active } = req.query;
        const devices = await DeviceModel.find({ is_active });
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found for this status" });
        }
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
    getDeviceByCategory,
    getDeviceByUserAndCategory,
    getDeviceByUserAndType,
    getDeviceByLocation,
    getDeviceByGardenName,
    getDeviceByType,
    getDeviceByIsActive
}