import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SizeController } from './size.controller';
import { SizeValidation } from './size.validation';

const router = Router();

router.post(
  '/',
  auth('ADMIN'),
  validateRequest(SizeValidation.createSize),
  SizeController.createSize
);

router.get('/', SizeController.getAllSizes);

router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(SizeValidation.updateSize),
  SizeController.updateSize
);

router.delete(
  '/:id',
  auth('ADMIN'),
  SizeController.deleteSize
);

export const SizeRoutes = router;
