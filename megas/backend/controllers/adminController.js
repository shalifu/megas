const { query } = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const users = await query(
      'SELECT id, username, email, role, approved, chief_position, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load users.' });
  }
};

exports.approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    await query('UPDATE users SET approved = 1 WHERE id = ?', [id]);
    return res.json({ message: 'User approved successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to approve user.' });
  }
};

exports.promoteUser = async (req, res) => {
  const { id } = req.params;
  const { role, chief_position } = req.body;

  if (!['preadmin', 'admin', 'client'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    await query(
      'UPDATE users SET role = ?, chief_position = ?, approved = 1 WHERE id = ?',
      [role, chief_position || null, id]
    );
    return res.json({ message: 'User role updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to promote user.' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [users] = await query('SELECT COUNT(*) AS total FROM users');
    const [orders] = await query('SELECT COUNT(*) AS total FROM orders');
    const [jobs] = await query('SELECT COUNT(*) AS total FROM job_applications');
    const [revenue] = await query(
      "SELECT COALESCE(SUM(budget), 0) AS total FROM orders WHERE status IN ('pending','in_progress','completed')"
    );
    const [notifications] = await query('SELECT COUNT(*) AS total FROM notifications WHERE is_read = 0');

    return res.json({
      totalUsers: users.total,
      totalOrders: orders.total,
      totalJobs: jobs.total,
      revenue: revenue.total,
      unreadNotifications: notifications.total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load dashboard summary.' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const queryPhrase = `%${req.query.q || ''}%`;
    const users = await query(
      'SELECT id, username, email, role, approved, chief_position FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC',
      [queryPhrase, queryPhrase]
    );
    return res.json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to search users.' });
  }
};

exports.getChiefApplications = async (req, res) => {
  try {
    const applications = await query(
      'SELECT id, username, email, chief_position, created_at FROM users WHERE chief_application = 1 ORDER BY created_at DESC'
    );
    return res.json({ applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load chief applications.' });
  }
};

exports.approveChiefApplication = async (req, res) => {
  const { id } = req.params;
  const { chief_position } = req.body;

  if (!chief_position) {
    return res.status(400).json({ message: 'Chief position is required.' });
  }

  try {
    await query(
      'UPDATE users SET role = ?, chief_application = 0, approved = 1, chief_position = ? WHERE id = ?',
      ['admin', chief_position, id]
    );
    return res.json({ message: 'Chief application approved successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to approve chief application.' });
  }
};

exports.rejectChiefApplication = async (req, res) => {
  const { id } = req.params;

  try {
    await query('UPDATE users SET chief_application = 0 WHERE id = ?', [id]);
    return res.json({ message: 'Chief application rejected.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to reject chief application.' });
  }
};
