const DeviceModel = require("../model/device.model")
const UserModel = require("../model/user.model")

const getDeviceById = async (req, res) => {
    try {
        const { device_id } = req.query;

        if (!device_id) {
            return res.status(400).json({ message: "device_id is required" });
        }

        const device = await DeviceModel.findOne({ device_id });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }
        res.status(200).json({
            status:200,
            message:'Find device successfully',
            data: device
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getAllDevices = async (req, res) => {
    try {
        const devices = await DeviceModel.find();
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: "No devices found" });
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

const createDevice = async (req, res) => {
    try {
        const { device_id, device_name, type, user, location } = req.body;

        if (!device_id || !device_name || !type) {
            return res.status(400).json({ message: "device_id, device_name, and type are required" });
        }

        const category = (type === 'pump' || type === 'led light') ? 'device' : 'sensor';
        let feed;
        if (type === 'pump') {
            feed = 'V10';
        } else if (type === 'led light') {
            feed = 'V11';
        } else if (type === 'temperature sensor') {
            feed = 'V1';
        } else if (type === 'soil moisture sensor') {
            feed = 'V3';
        } else if (type === 'light sensor') {
            feed = 'V4';
        } else {
            return res.status(400).json({ message: "Invalid device type" });
        }

        if (!user && location) {
            return res.status(400).json({ message: "Location should not be provided when user is not specified" });
        }

        if(user){
            const userExists = await UserModel.findOne({ email: user });
            if (!userExists) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!location) {
                return res.status(400).json({ message: "Location is required when user is provided" });
            }
            if (!location.garden_name || !location.latitude || !location.longitude) {
                return res.status(400).json({ message: "Location must include garden_name, latitude, and longitude" });
            }
            const gardenExists = userExists.gardens.some(garden =>
                garden.name === location.garden_name &&
                garden.latitude === location.latitude &&
                garden.longitude === location.longitude
            );
            if (!gardenExists) {
                return res.status(400).json({
                    message: "Garden does not match any existing garden for this user (check garden_name, latitude, and longitude)"
                });
            }
        }

        const newDevice = new DeviceModel({ 
            device_id: device_id, 
            device_name: device_name, 
            type: type,
            category: category,
            feed: feed,
            user: !user ? null : user, 
            location: location,
            time_on: null,
            time_off: null,
            is_active: false
        });
        await newDevice.save();
        res.status(201).json({
            status:201,
            message:'Create device successfully',
            data: newDevice
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const updateDeviceByUser = async (req, res) => {
    try {
        const { user, device_id, location } = req.body;

        // Bắt buộc có device_id
        if (!device_id) {
            return res.status(400).json({ message: "device_id is required" });
        }

        // Bắt buộc user và location phải cùng có mặt (cùng null hoặc cùng có giá trị)
        const hasUser = user !== undefined;
        const hasLocation = location !== undefined;

        if (hasUser !== hasLocation) {
            return res.status(400).json({ message: "user and location must either both be provided or both be null" });
        }

        const device = await DeviceModel.findOne({ device_id });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Nếu user là null => reset user & location về null
        if (user === null) {
            device.user = null;
            device.location = null;
            await device.save();
            return res.status(200).json({
                status: 200,
                message: "Device updated with null user and location",
                data: device
            });
        }

        // Nếu user khác null => validate user và location
        const userExists = await UserModel.findOne({ email: user });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!location || !location.garden_name || !location.latitude || !location.longitude) {
            return res.status(400).json({ message: "Location must include garden_name, latitude, and longitude" });
        }

        const gardenExists = userExists.gardens.some(garden =>
            garden.name === location.garden_name &&
            garden.latitude === location.latitude &&
            garden.longitude === location.longitude
        );

        if (!gardenExists) {
            return res.status(400).json({
                message: "Garden does not match any existing garden for this user (check garden_name, latitude, and longitude)"
            });
        }

        // Cập nhật thiết bị với user và location hợp lệ
        device.user = user;
        device.location = location;
        await device.save();

        res.status(200).json({
            status: 200,
            message: "Device updated successfully",
            data: device
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const updateDeviceByTimer = async (req, res) => {
    try {
        const { device_id, time_on, time_off } = req.body;

        // Bắt buộc có device_id
        if (!device_id) {
            return res.status(400).json({ message: "device_id is required" });
        }

        const device = await DeviceModel.findOne({ device_id });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Kiểm tra time_on và time_off (có thể null, nhưng nếu có giá trị thì phải hợp lệ)
        if (time_on !== undefined && time_off !== undefined) {
            if (time_on !== null && isNaN(new Date(time_on))) {
                return res.status(400).json({ message: "time_on must be a valid date or null" });
            }
            if (time_off !== null && isNaN(new Date(time_off))) {
                return res.status(400).json({ message: "time_off must be a valid date or null" });
            }
        } else {
            return res.status(400).json({ message: "time_on and time_off are required" });
        }

        // Nếu có giá trị thì phải lớn hơn thời gian hiện tại
        if (time_on && time_off) {
            const timeOnDate = new Date(time_on);
            const timeOffDate = new Date(time_off);
            const now = new Date();

            if (timeOnDate <= now || timeOffDate <= now) {
                return res.status(400).json({
                    message: "Both time_on and time_off must be in the future (UTC timezone)"
                });
            }

            if (timeOffDate <= timeOnDate) {
                return res.status(400).json({ message: "time_off must be greater than time_on" });
            }
        }

        // Cập nhật thời gian bật/tắt thiết bị
        device.time_on = time_on !== null ? new Date(time_on) : null;
        device.time_off = time_off !== null ? new Date(time_off) : null;
        await device.save();

        res.status(200).json({
            status: 200,
            message: "Device updated successfully",
            data: device
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const updateDeviceActive = async (req, res) => {
    try {
        const { device_id, is_active } = req.body;

        // Bắt buộc có device_id
        if (!device_id) {
            return res.status(400).json({ message: "device_id is required" });
        }

        if (is_active === undefined) {
            return res.status(400).json({ message: "is_active is required" });
        }
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ message: "is_active must be a boolean" });
        }

        const device = await DeviceModel.findOne({ device_id });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Cập nhật trạng thái thiết bị
        device.is_active = is_active;
        await device.save();

        res.status(200).json({
            status: 200,
            message: "Device updated successfully",
            data: device
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const deleteDeviceById = async (req, res) => {
    try {
        const { device_id } = req.body;

        const device = await DeviceModel.findOneAndDelete({ device_id });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }
        res.status(200).json({
            status: 200,
            message: "Device deleted successfully",
            data: device
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const deleteDeviceByUser = async (req, res) => {
    try {
        const { user } = req.body;
        if (!user) {
            return res.status(400).json({ message: "User's email is required" });
        }
        const devices = await DeviceModel.deleteMany({ user: user });
        if (devices.deletedCount === 0) {
            return res.status(404).json({ message: "No devices found for this user" });
        }
        res.status(200).json({
            status:200,
            message:'Delete devices successfully',
            data: devices
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    getDeviceById,
    getAllDevices,
    getDeviceByUser,
    getDeviceByCategory,
    getDeviceByUserAndCategory,
    getDeviceByUserAndType,
    getDeviceByLocation,
    getDeviceByGardenName,
    getDeviceByType,
    getDeviceByIsActive,
    createDevice,
    updateDeviceByUser,
    updateDeviceByTimer,
    updateDeviceActive,
    deleteDeviceById,
    deleteDeviceByUser
}