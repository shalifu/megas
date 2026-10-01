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
    const task = await query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task[0]) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const previousStatus = task[0].status;
    await query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);

    if (status === 'completed' && previousStatus !== 'completed') {
      const assignee = await query('SELECT username FROM users WHERE id = ?', [task[0].assigned_to]);
      const assigneeName = assignee[0]?.username || 'Task assignee';
      const creatorText = `${assigneeName} marked task "${task[0].title}" as completed.`;

      await query('INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, 0)', [task[0].created_by, creatorText]);

      const adminUsers = await query('SELECT id FROM users WHERE role = ? AND approved = 1', ['admin']);
      for (const admin of adminUsers) {
        if (admin.id !== task[0].created_by) {
          await query('INSERT INTO notifications (user_id, text, is_read) VALUES (?, ?, 0)', [admin.id, creatorText]);
        }
      }
    }

    return res.json({ message: 'Task status updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update task status.' });
  }
};
