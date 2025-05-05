const SessionModel = require('../model/session.model'); // điều chỉnh đường dẫn nếu cần

const getAllSessions = async (req, res) => {
    try {
        const sessions = await SessionModel.find({});
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
  
module.exports = { getAllSessions} ;