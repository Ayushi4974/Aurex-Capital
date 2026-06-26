const Notification = require('../models/Notification');

let _io = null;

const init = (io) => { _io = io; };

const send = async (userId, title, message, type = 'system', data = {}) => {
  try {
    const notif = await Notification.create({ userId, title, message, type, data });
    if (_io) {
      _io.to(userId).emit('notification', { notif });
    }
    return notif;
  } catch (err) {
    console.error('[NotificationService] Error:', err.message);
  }
};

module.exports = { init, send };
