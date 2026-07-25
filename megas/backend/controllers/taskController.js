const { query } = require('../config/db');

exports.createTask = async (req, res) => {
  const { title, description, assigned_to, due_date } = req.body;

  if (!title || !assigned_to) {
    return res.status(400).json({ message: 'Task title and assignee are required.' });
  }

  try {
    await query(
      'INSERT INTO tasks (title, description, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', assigned_to, req.user.id, due_date || null]
    );
    return res.status(201).json({ message: 'Task created successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to create task.' });
  }
};

exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await query(
      'SELECT tasks.*, users.username AS creator_name FROM tasks JOIN users ON tasks.created_by = users.id WHERE assigned_to = ? ORDER BY updated_at DESC',
      [req.user.id]
    );
    return res.json({ tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load tasks.' });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await query(
      'SELECT tasks.*, users.username AS assigned_name, creators.username AS creator_name FROM tasks JOIN users ON tasks.assigned_to = users.id JOIN users AS creators ON tasks.created_by = creators.id ORDER BY updated_at DESC'
    );
    return res.json({ tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load tasks.' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['todo', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid task status.' });
  }

  try {
    await query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    return res.json({ message: 'Task status updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update task status.' });
  }
};
