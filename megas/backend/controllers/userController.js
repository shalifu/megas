const { query } = require('../config/db');

exports.getCurrentUser = async (req, res) => {
  try {
    const [user] = await query('SELECT id, username, email, role, approved, chief_position, created_at FROM users WHERE id = ?', [req.user.id]);
    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load profile.' });
  }
};

exports.getClientSummary = async (req, res) => {
  try {
    const [orders] = await query('SELECT COUNT(*) AS total FROM orders WHERE client_id = ?', [req.user.id]);
    const [applications] = await query('SELECT COUNT(*) AS total FROM job_applications WHERE user_id = ?', [req.user.id]);
    const [notifications] = await query('SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);

    return res.json({
      orders: orders.total,
      appliedJobs: applications.total,
      unreadNotifications: notifications.total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load client summary.' });
  }
};

exports.getPreAdminSummary = async (req, res) => {
  try {
    const [messages] = await query(
      'SELECT COUNT(*) AS total FROM messages WHERE sender_id = ? OR receiver_id = ?',
      [req.user.id, req.user.id]
    );
    const [notifications] = await query('SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);
    const [teamMembers] = await query(
      'SELECT COUNT(*) AS total FROM users WHERE role IN (?, ?)',
      ['preadmin', 'client']
    );

    return res.json({
      messages: messages[0]?.total || 0,
      unreadNotifications: notifications[0]?.total || 0,
      teamMembers: teamMembers[0]?.total || 0,
      role: req.user.role
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load pre-admin summary.' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await query('SELECT id, name, description FROM roles ORDER BY name');
    return res.json({ roles });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load roles.' });
  }
};
