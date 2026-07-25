const { query } = require('../config/db');

exports.getChefConversations = async (req, res) => {
  try {
    // Get all chef users including head admin (admins with chief_position OR head administrator)
    const chefUsers = await query(
      `SELECT id, username, chief_position FROM users 
       WHERE role = ? AND (chief_position IS NOT NULL AND chief_position != "" OR username = 'Admin User')
       AND id != ?`,
      ['admin', req.user.id]
    );

    // Get chef group chat messages
    const groupMessages = await query(
      `SELECT m.*, u.username, u.chief_position 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_type = 'chef_group'
       ORDER BY m.created_at DESC 
       LIMIT 50`
    );

    return res.json({ chefUsers, groupMessages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load chef conversations.' });
  }
};

exports.getChefMessages = async (req, res) => {
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

exports.sendChefMessage = async (req, res) => {
  const { receiverId, message, isGroup } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  try {
    let result;
    let note;

    if (isGroup) {
      // Send to chef group chat
      result = await query(
        'INSERT INTO messages (sender_id, receiver_id, message, chat_type) VALUES (?, ?, ?, ?)',
        [req.user.id, null, message, 'chef_group']
      );
      
      // Notify all chef users
      const chefUsers = await query(
        'SELECT id FROM users WHERE role = ? AND (chief_position IS NOT NULL AND chief_position != "" OR username = "Admin User") AND id != ?',
        ['admin', req.user.id]
      );
      
      for (const chef of chefUsers) {
        note = `${req.user.username} (${req.user.chief_position || 'Admin User'}): ${message}`;
        await query('INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, 0)', [chef.id, note]);
      }
    } else {
      // Send direct message
      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver is required for direct messages.' });
      }
      
      result = await query(
        'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [req.user.id, receiverId, message]
      );

      note = `${req.user.username} (${req.user.chief_position || 'Admin User'}) sent a new message.`;
      await query('INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, 0)', [receiverId, note]);
    }

    return res.status(201).json({
      message: {
        id: result.lastInsertRowid,
        senderId: req.user.id,
        receiverId,
        message,
        created_at: new Date(),
        isGroup,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to send message.' });
  }
};
