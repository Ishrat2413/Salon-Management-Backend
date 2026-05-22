import { Router } from 'express';

import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = Router();

router.get('/me', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), UserController.getMe);
router.delete('/me', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), UserController.deleteMe);
router.get('/', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), UserController.getAllUsers);
router.patch(
  '/:id/role',
  auth('ADMIN'),
  validateRequest(UserValidation.changeRole),
  UserController.changeRole
);
router.patch(
  '/:id/status',
  auth('ADMIN'),
  validateRequest(UserValidation.changeStatus),
  UserController.changeStatus
);
router.patch(
  '/:id/commission-rate',
  auth('ADMIN'),
  validateRequest(UserValidation.updateCommissionRate),
  UserController.updateCommissionRate
);
router.delete(
  '/:id',
  auth('ADMIN'),
  UserController.deleteUser
);

export const UserRoutes = router;
