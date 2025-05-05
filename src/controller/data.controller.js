const DataModel = require("../model/data.model")
const UserModel = require("../model/user.model")
const DeviceModel = require("../model/device.model")

const getDataByDay = async (req, res) => {
    try {
        const { user, garden_name, device_name, day, year, month } = req.query;
        const device_name1 = decodeURIComponent(req.query.device_name);

        // Kiểm tra xem người dùng có tồn tại không
        const userExists = await UserModel.findOne({ email: user });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        // Kiểm tra khu vườn có thuộc người dùng không
        for (let garden of userExists.gardens) {
            if (garden.garden_name === garden_name) {
                // Kiểm tra thiết bị có thuộc khu vườn không
                const deviceExists = await DeviceModel.findOne({ device_name: device_name1 });
                if (!deviceExists) {
                    return res.status(404).json({ message: "Device not found" });
                }
                if (deviceExists.location.garden_name === garden_name) {
                    break;
                } else {
                    return res.status(404).json({ message: "Device not found in this garden" });
                }
            }
        }

        const data = await DataModel.find({ 
            user: user,
            garden_name: garden_name,
            device_name: device_name1,
            year: year, 
            month: month,
            day: day
        });

        if (data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        } else {
            // Nhóm theo giờ
            const hourlyData = {};

            data.forEach(item => {
                const hour = item.hour;
                if (!hourlyData[hour]) {
                    hourlyData[hour] = { sum: 0, count: 0 };
                }
                hourlyData[hour].sum += item.value;
                hourlyData[hour].count += 1;
            });

            const result = Object.keys(hourlyData).map(hour => {
                const avgValue = hourlyData[hour].sum / hourlyData[hour].count;
                return {
                    hour: parseInt(hour),
                    value: avgValue
                };
            }).sort((a, b) => a.hour - b.hour); // Sắp xếp theo giờ tăng dần

            return res.status(200).json(result);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


const getDataByMonth = async (req, res) => {
    try {
        const { user, garden_name, device_name, year, month } = req.query;
        const device_name1 = decodeURIComponent(req.query.device_name);

        // Kiểm tra xem người dùng có tồn tại không
        const userExists = await UserModel.findOne({ email: user });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        // Kiểm tra khu vườn có thuộc người dùng không
        for (let garden of userExists.gardens) {
            if (garden.garden_name === garden_name) {
                // Kiểm tra thiết bị có thuộc khu vườn không
                const deviceExists = await DeviceModel.findOne({ device_name: device_name1 });
                if (!deviceExists) {
                    return res.status(404).json({ message: "Device not found" });
                }
                if (deviceExists.location.garden_name === garden_name) {
                    break;
                } else {
                    return res.status(404).json({ message: "Device not found in this garden" });
                }
            }
        }

        const data = await DataModel.find({ 
            user: user,
            garden_name: garden_name,
            device_name: device_name1,
            year: year, 
            month: month 
        });


        if (data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        } else {
            // Nhóm theo ngày (theo format 'dd-mm-yyyy')
            const groupedData = {};

            // Nhóm và tính tổng giá trị mỗi ngày
            data.forEach(item => {
                const date = `${item.day < 10 ? '0' + item.day : item.day}-${item.month < 10 ? '0' + item.month : item.month}-${item.year}`;
                if (!groupedData[date]) {
                    groupedData[date] = { sum: 0, count: 0 };
                }
                groupedData[date].sum += item.value;
                groupedData[date].count += 1;
            });

            // Tính trung bình giá trị cho mỗi ngày
            const result = Object.keys(groupedData).map(date => {
                const avgValue = groupedData[date].sum / groupedData[date].count;
                return {
                    date: date,
                    value: avgValue
                };
            });

            // Trả về kết quả
            return res.status(200).json(result);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getDataByYear = async (req, res) => {
    try {
        const { user, garden_name, device_name, year } = req.query;
        const device_name1 = decodeURIComponent(req.query.device_name);

        // Kiểm tra xem người dùng có tồn tại không
        const userExists = await UserModel.findOne({ email: user });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra khu vườn có thuộc người dùng không
        for (let garden of userExists.gardens) {
            if (garden.garden_name === garden_name) {
                // Kiểm tra thiết bị có thuộc khu vườn không
                const deviceExists = await DeviceModel.findOne({ device_name: device_name1 });
                if (!deviceExists) {
                    return res.status(404).json({ message: "Device not found" });
                }
                if (deviceExists.location.garden_name === garden_name) {
                    break;
                } else {
                    return res.status(404).json({ message: "Device not found in this garden" });
                }
            }
        }

        // Tạo điều kiện lọc
        const query = {
            user,
            garden_name,
            device_name: device_name1,
        };

        if (start_time && end_time) {
            query.timestamp = {
                $gte: new Date(start_time),
                $lte: new Date(end_time)
            };
        }

        const data = await DataModel.find(query).select('timestamp value -_id');

        if (data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }

        return res.status(200).json(data);
        }

    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getDataByTimestamp = async (req, res) => {
    try {
        const { user, garden_name, device_name, start_time, end_time } = req.query;
        const device_name1 = decodeURIComponent(req.query.device_name);

        // Kiểm tra xem người dùng có tồn tại không
        const userExists = await UserModel.findOne({ email: user });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        // Kiểm tra khu vườn có thuộc người dùng không
        for (let garden of userExists.gardens) {
            if (garden.garden_name === garden_name) {
                // Kiểm tra thiết bị có thuộc khu vườn không
                const deviceExists = await DeviceModel.findOne({ device_name: device_name1 });
                if (!deviceExists) {
                    return res.status(404).json({ message: "Device not found" });
                }
                if (deviceExists.location.garden_name === garden_name) {
                    break;
                } else {
                    return res.status(404).json({ message: "Device not found in this garden" });
                }
            }
        }

        // Tạo truy vấn
        const query = {
            user,
            garden_name,
            device_name: device_name1,
        };

        // Nếu có truyền start_time và end_time thì thêm điều kiện thời gian
        if (start_time && end_time) {
            const start = new Date(start_time);
            const end = new Date(end_time);
            if (isNaN(start) || isNaN(end)) {
                return res.status(400).json({ message: "Invalid start_time or end_time format" });
            }
            query.timestamp = { $gte: start, $lte: end };
        }

        const data = await DataModel.find(query);

        if (data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        } else {
            const formattedData = data.map(d => ({
                timestamp: d.timestamp,
                value: d.value
            }));
            
            return res.status(200).json(formattedData);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getDataByDay,
    getDataByMonth,
    getDataByYear,
    getDataByTimestamp
}