const Notification = require('../model/noti.model');

const getNotificationByUser = async (req, res) => {
    const { user } = req.query;
    try {
        if (!user) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const notifications = await Notification.find({ receiverId: user }).sort({ createdAt: -1 });
        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found for this user' });
        }
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
}

const markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ message: 'Notification ID is required' });
        }
        
        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error });
    }
}

const getAllNotifications = async (req, res) => {
    try {
        // Extract pagination parameters from request query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Count total number of notifications
        const totalCount = await Notification.countDocuments();
        
        // Get notifications with pagination
        const notifications = await Notification.find()
            .sort({ createdAt: -1 }) // Sort by most recent first
            .skip(skip)
            .limit(limit);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);
        
        res.status(200).json({
            notifications,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all notifications', error });
    }
}

module.exports = {
    getNotificationByUser,
    markNotificationAsRead,
    getAllNotifications,
}