const { query } = require('../config/db');

exports.applyForChef = async (req, res) => {
  const { roleId, experience, qualifications, userId } = req.body;

  if (!roleId || !experience || !qualifications) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Determine if this is admin creating for user or user applying for themselves
  const targetUserId = userId || req.user.id;
  const isAdminCreating = req.user.role === 'admin' && userId;

  try {
    // Check if user has already applied
    const existingApplication = await query(
      'SELECT id FROM chef_applications WHERE user_id = ?',
      [targetUserId]
    );

    if (existingApplication.length > 0) {
      return res.status(409).json({ message: 'User already has a chef application.' });
    }

    // Get role name and user info
    const role = await query('SELECT name FROM roles WHERE id = ?', [roleId]);
    const user = await query('SELECT username FROM users WHERE id = ?', [targetUserId]);
    
    if (role.length === 0) {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }

    await query(
      'INSERT INTO chef_applications (user_id, role_id, experience, qualifications, status) VALUES (?, ?, ?, ?, ?)',
      [targetUserId, roleId, experience, qualifications, 'pending']
    );

    // Create notification for all admins
    const admins = await query('SELECT id FROM users WHERE role = ? AND approved = 1', ['admin']);
    for (const admin of admins) {
      await query(
        'INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, ?)',
        [admin.id, `New chef application received for ${role[0].name} by ${user[0].username}`, 0]
      );
    }

    const message = isAdminCreating 
      ? 'Chef application created successfully.' 
      : 'Chef application submitted successfully.';
    
    return res.status(201).json({ message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to submit chef application.' });
  }
};

exports.getUserChefApplication = async (req, res) => {
  try {
    const applications = await query(
      `SELECT chef_applications.*, roles.name as role_name 
       FROM chef_applications 
       JOIN roles ON chef_applications.role_id = roles.id 
       WHERE chef_applications.user_id = ? 
       ORDER BY chef_applications.created_at DESC`,
      [req.user.id]
    );
    return res.json({ applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load chef applications.' });
  }
};

exports.getAllChefApplications = async (req, res) => {
  try {
    const applications = await query(
      `SELECT chef_applications.*, users.username as applicant_name, users.email as applicant_email, roles.name as role_name 
       FROM chef_applications 
       JOIN users ON chef_applications.user_id = users.id 
       JOIN roles ON chef_applications.role_id = roles.id 
       ORDER BY chef_applications.created_at DESC`
    );
    return res.json({ applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load chef applications.' });
  }
};

exports.updateChefApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assignPosition } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid application status.' });
  }

  try {
    // Get the application details
    const application = await query(
      'SELECT chef_applications.*, users.email as user_email FROM chef_applications JOIN users ON chef_applications.user_id = users.id WHERE chef_applications.id = ?',
      [id]
    );

    if (application.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Update application status
    await query('UPDATE chef_applications SET status = ? WHERE id = ?', [status, id]);

    // If approved and position should be assigned, update user role and position
    if (status === 'approved' && assignPosition) {
      const [app] = application;
      
      // Update user role and chief_position
      await query(
        'UPDATE users SET role = ?, chief_position = ? WHERE id = ?',
        ['admin', app.role_name, app.user_id]
      );

      // Create notification for the user
      await query(
        'INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, ?)',
        [app.user_id, `Congratulations! Your chef application for ${app.role_name} has been approved. You are now a ${app.role_name}.`, 0]
      );
    }

    return res.json({ message: 'Chef application updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update chef application.' });
  }
};
