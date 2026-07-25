const { query } = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await query(
      'SELECT id, text, is_read AS isRead, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    return res.json({ notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load notifications.' });
  }
};

exports.markRead = async (req, res) => {
  const { id } = req.params;
  try {
    await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update notification.' });
  }
};
