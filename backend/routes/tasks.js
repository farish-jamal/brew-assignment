import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

const createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Status must be To Do, In Progress, or Done'),
];

const updateTaskValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Status must be To Do, In Progress, or Done'),
];

router.get('/', authenticate, taskController.getTasks);
router.get('/stats', authenticate, taskController.getStats);
router.post('/', authenticate, createTaskValidation, taskController.createTask);
router.put('/:id', authenticate, updateTaskValidation, taskController.updateTask);
router.delete('/:id', authenticate, taskController.deleteTask);

export default router;
