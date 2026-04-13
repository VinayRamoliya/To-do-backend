const express = require('express');
const {
  createTask,
  getTasks,
  getTaskSummary,
  deleteTask,
  clearCompletedTasks,
  updateTask,
} = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/summary', getTaskSummary);
router.get('/', getTasks);
router.delete('/completed', clearCompletedTasks);
router.delete('/:id([0-9a-fA-F]{24})', deleteTask);
router.patch('/:id([0-9a-fA-F]{24})', updateTask);

module.exports = router;
