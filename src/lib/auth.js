const jwt = require("jsonwebtoken");

// Middleware kiểm tra JWT
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access Denied! No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // Gán thông tin user vào request

        next(); // Tiếp tục xử lý request
    } catch (error) {
        return res.status(403).json({ message: "Invalid Token!" });
    }
};

// Middleware phân quyền (Chỉ User mới truy cập được)
const userMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "USER") {
        return res.status(403).json({ message: "Access Denied! Users only." });
    }

    next(); // Tiếp tục nếu là user
};

// Middleware phân quyền (Chỉ Admin mới truy cập được)
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access Denied! Admins only." });
    }

    next(); // Tiếp tục nếu là admin
};

module.exports = { authMiddleware, userMiddleware, adminMiddleware };