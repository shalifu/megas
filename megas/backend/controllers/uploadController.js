const { query } = require('../config/db');

exports.applyWithCv = async (req, res) => {
  const { jobTitle } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!jobTitle) {
    return res.status(400).json({ message: 'Job title is required.' });
  }

  try {
    await query(
      'INSERT INTO job_applications (user_id, job_title, cv_file, status) VALUES (?, ?, ?, ?)',
      [req.user.id, jobTitle, filePath, 'pending']
    );
    return res.status(201).json({ message: 'Job application submitted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to submit job application.' });
  }
};
