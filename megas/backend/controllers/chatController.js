const { query } = require('../config/db');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await query(
      `SELECT DISTINCT
         u.id,
         u.username,
         u.role,
         u.chief_position,
         u.approved,
         COALESCE((
           SELECT message FROM messages m2
           WHERE (m2.sender_id = ? AND m2.receiver_id = u.id)
             OR (m2.sender_id = u.id AND m2.receiver_id = ?)
           ORDER BY m2.created_at DESC
           LIMIT 1
         ), '') AS last_message,
         COALESCE((
           SELECT created_at FROM messages m2
           WHERE (m2.sender_id = ? AND m2.receiver_id = u.id)
             OR (m2.sender_id = u.id AND m2.receiver_id = ?)
           ORDER BY m2.created_at DESC
           LIMIT 1
         ), '') AS last_at
       FROM users u
       WHERE u.id IN (
         SELECT IF(sender_id = ?, receiver_id, sender_id) FROM messages WHERE sender_id = ? OR receiver_id = ?
       )
       ORDER BY last_at DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    return res.json({ conversations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load conversations.' });
  }
};

exports.getMessages = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await query(
      'SELECT id, sender_id AS senderId, receiver_id AS receiverId, message, created_at FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC',
      [req.user.id, userId, userId, req.user.id]
    );
    return res.json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load messages.' });
  }
};

exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ message: 'Receiver and message are required.' });
  }

  try {
    const result = await query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [req.user.id, receiverId, message]
    );

    const note = `${req.user.username} sent a new message.`;
    await query('INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, 0)', [receiverId, note]);

    return res.status(201).json({
      message: {
        id: result.lastInsertRowid,
        senderId: req.user.id,
        receiverId,
        message,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to send message.' });
  }
};
