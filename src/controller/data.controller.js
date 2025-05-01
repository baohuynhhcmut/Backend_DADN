const DataModel = require("../model/data.model")
const UserModel = require("../model/user.model")
const DeviceModel = require("../model/device.model")

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

        // Lấy dữ liệu từ DataModel cho năm và khu vườn
        const data = await DataModel.find({ 
            user: user,
            garden_name: garden_name,
            device_name: device_name1,
            year: year 
        });

        if (data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        } else {
            // Nhóm theo tháng
            const groupedData = {};

            // Nhóm và tính tổng giá trị mỗi tháng
            data.forEach(item => {
                const month = `${item.month}-${item.year}`; // Sử dụng month trực tiếp
                if (!groupedData[month]) {
                    groupedData[month] = { sum: 0, count: 0 };
                }
                groupedData[month].sum += item.value;
                groupedData[month].count += 1;
            });

            // Tính trung bình giá trị cho mỗi tháng trong năm
            const result = Object.keys(groupedData).map(month => {
                const avgValue = groupedData[month].sum / groupedData[month].count;
                return {
                    month: month,
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

module.exports = {
    getDataByMonth,
    getDataByYear
}