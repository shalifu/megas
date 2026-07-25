const { query } = require('../config/db');

exports.applyForJob = async (req, res) => {
  const { jobTitle, cvFile, status } = req.body;

  if (!jobTitle) {
    return res.status(400).json({ message: 'Job title is required.' });
  }

  try {
    await query(
      'INSERT INTO job_applications (user_id, job_title, cv_file, status) VALUES (?, ?, ?, ?)',
      [req.user.id, jobTitle, cvFile || '', 'pending']
    );

    // Create notification for all admins
    const admins = await query('SELECT id FROM users WHERE role = ? AND approved = 1', ['admin']);
    for (const admin of admins) {
      await query(
        'INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, ?)',
        [admin.id, `New job application received: ${jobTitle} by ${req.user.username}`, 0]
      );
    }

    return res.status(201).json({ message: 'Job application submitted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to submit job application.' });
  }
};

exports.getClientApplications = async (req, res) => {
  try {
    const applications = await query('SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load applications.' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await query(
      'SELECT job_applications.*, users.username AS applicant_name, users.email AS applicant_email FROM job_applications JOIN users ON job_applications.user_id = users.id ORDER BY job_applications.created_at DESC'
    );
    return res.json({ applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load job applications.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid application status.' });
  }

  try {
    await query('UPDATE job_applications SET status = ? WHERE id = ?', [status, id]);
    return res.json({ message: 'Application updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update application status.' });
  }
};

exports.searchApplications = async (req, res) => {
  try {
    const queryPhrase = `%${req.query.q || ''}%`;
    const applications = await query(
      'SELECT job_applications.*, users.username AS applicant_name FROM job_applications JOIN users ON job_applications.user_id = users.id WHERE job_applications.job_title LIKE ? OR users.username LIKE ? ORDER BY job_applications.created_at DESC',
      [queryPhrase, queryPhrase]
    );
    return res.json({ applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to search applications.' });
  }
};
