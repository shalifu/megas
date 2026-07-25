const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      approved: user.approved,
      chief_position: user.chief_position,
    },
    process.env.JWT_SECRET || 'replace-with-secret',
    { expiresIn: '7d' }
  );
}

exports.signup = async (req, res) => {
  const { username, email, password, confirmPassword, applyForChief } = req.body;

  console.log('Signup request:', { username, email, applyForChief });

  if (!username || !email || !password || password !== confirmPassword) {
    console.log('Validation failed');
    return res.status(400).json({ message: 'All fields are required and passwords must match.' });
  }

  try {
    console.log('Checking for existing user...');
    const users = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length > 0) {
      console.log('Email already registered');
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const chiefApp = applyForChief ? 1 : 0;
    
    console.log('Inserting user into database...');
    await query(
      'INSERT INTO users (username, email, password, role, approved, chief_application) VALUES (?, ?, ?, ?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), hashedPassword, 'client', 1, chiefApp]
    );

    console.log('User created successfully');
    const message = chiefApp 
      ? 'Signup successful! Your account is active. Your chief application is pending admin approval.' 
      : 'Signup successful! Your account is active. You can now login.';
    return res.status(201).json({ message });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Unable to create your account.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        approved: user.approved,
        chief_position: user.chief_position,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to log in.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ message: 'Logged out successfully.' });
};

exports.me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      approved: req.user.approved,
      chief_position: req.user.chief_position,
    },
  });
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const users = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await query('UPDATE users SET password_reset_token = ? WHERE email = ?', [resetToken, email.trim().toLowerCase()]);

    return res.json({ 
      message: 'Please contact admin to reset your password. Your reset token has been generated.',
      token: resetToken
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to process password reset request.' });
  }
};

exports.resetPasswordAdmin = async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ message: 'User ID and new password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ?, password_reset_token = NULL WHERE id = ?', [hashedPassword, userId]);
    return res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to reset password.' });
  }
};
