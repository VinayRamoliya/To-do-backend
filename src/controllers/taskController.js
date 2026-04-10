const Task = require('../models/Task');

async function createTask(req, res) {
  try {
    const { title, description, priority, status, category, deadline } = req.body;
    if (!title || String(title).trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const parsedDeadline = deadline ? new Date(deadline) : null;
    if (deadline && Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description != null ? String(description) : '',
      priority: priority || 'medium',
      status: status || 'pending',
      category: category || 'work',
      deadline: parsedDeadline,
      user: req.userId,
    });
    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getTasks(req, res) {
  try {
    const { status, category, search } = req.query;
    const query = { user: req.userId };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search && String(search).trim()) {
      const s = String(search).trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json({ message: 'Task deleted', id: task._id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateTask(req, res) {
  try {
    const { status, title, description, priority, category, deadline } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (category !== undefined) updates.category = category;
    if (deadline !== undefined) {
      if (!deadline) {
        updates.deadline = null;
      } else {
        const parsedDeadline = new Date(deadline);
        if (Number.isNaN(parsedDeadline.getTime())) {
          return res.status(400).json({ message: 'Invalid deadline date' });
        }
        updates.deadline = parsedDeadline;
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { createTask, getTasks, deleteTask, updateTask };
