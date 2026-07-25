const { query } = require('../config/db');

exports.sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  try {
    await query(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );

    return res.status(201).json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ message: 'Unable to send contact message.' });
  }
};
