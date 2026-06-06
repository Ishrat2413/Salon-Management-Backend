import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TaskController } from './task.controller';
import { TaskValidation } from './task.validation';

const router = Router();

router.post(
  '/',
  auth('MANAGER', 'ADMIN'),
  validateRequest(TaskValidation.createTask),
  TaskController.createTask
);

router.get('/', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), TaskController.getAllTasks);

router.get('/:id', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), TaskController.getSingleTask);

router.patch(
  '/:id/request-completion',
  auth('EMPLOYEE'),
  validateRequest(TaskValidation.requestCompletion),
  TaskController.requestCompletion
);

router.patch(
  '/:id/approve-completion',
  auth('MANAGER', 'ADMIN'),
  TaskController.approveCompletion
);

router.patch(
  '/:id/complete',
  auth('MANAGER', 'ADMIN'),
  TaskController.markAsCompleted
);

router.patch(
  '/:id',
  auth('MANAGER', 'ADMIN'),
  validateRequest(TaskValidation.updateTask),
  TaskController.updateTask
);

router.delete('/:id', auth('MANAGER', 'ADMIN'), TaskController.deleteTask);

export const TaskRoutes = router;
