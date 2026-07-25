const { query } = require('../config/db');

exports.placeOrder = async (req, res) => {
  const { projectType, budget, description, deadline } = req.body;

  if (!projectType || !budget || !description) {
    return res.status(400).json({ message: 'Please complete the order form.' });
  }

  try {
    await query(
      'INSERT INTO orders (client_id, project_type, budget, description, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, projectType, budget, description, 'pending']
    );

    // Create notification for all admins
    const admins = await query('SELECT id FROM users WHERE role = ? AND approved = 1', ['admin']);
    for (const admin of admins) {
      await query(
        'INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, ?)',
        [admin.id, `New order received: ${projectType} by ${req.user.username}`, 0]
      );
    }

    return res.status(201).json({ message: 'Order submitted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to place order.' });
  }
};

exports.getClientOrders = async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders WHERE client_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load orders.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await query(
      'SELECT orders.*, users.username AS client_name, users.email AS client_email FROM orders JOIN users ON orders.client_id = users.id ORDER BY orders.created_at DESC'
    );
    return res.json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load orders.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'in_progress', 'completed', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid order status.' });
  }

  try {
    await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return res.json({ message: 'Order status updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update order status.' });
  }
};

exports.searchOrders = async (req, res) => {
  try {
    const queryPhrase = `%${req.query.q || ''}%`;
    const orders = await query(
      'SELECT orders.*, users.username AS client_name FROM orders JOIN users ON orders.client_id = users.id WHERE orders.project_type LIKE ? OR users.username LIKE ? ORDER BY orders.created_at DESC',
      [queryPhrase, queryPhrase]
    );
    return res.json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to search orders.' });
  }
};
