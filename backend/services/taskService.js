import Task from '../models/Task.js';

export const getTasks = async (userId, { status, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
  const query = { user: userId };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  return Task.find(query).sort(sortOptions);
};

export const getTaskStats = async (userId) => {
  const tasks = await Task.find({ user: userId });

  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'To Do').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    done: tasks.filter((t) => t.status === 'Done').length,
    highPriority: tasks.filter((t) => t.priority === 'high').length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
    ).length,
  };
};

export const createTask = async (userId, { title, description, dueDate, priority, status }) => {
  return Task.create({
    title,
    description: description || '',
    dueDate: dueDate || null,
    priority: priority || 'medium',
    status: status || 'To Do',
    user: userId,
  });
};

export const updateTask = async (userId, taskId, updates) => {
  const task = await Task.findOne({ _id: taskId, user: userId });

  if (!task) {
    throw { status: 404, message: 'Task not found' };
  }

  const { title, description, dueDate, priority, status } = updates;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;

  await task.save();
  return task;
};

export const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });

  if (!task) {
    throw { status: 404, message: 'Task not found' };
  }

  return { message: 'Task deleted successfully' };
};

