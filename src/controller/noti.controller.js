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

module.exports = {
    getNotificationByUser,
}