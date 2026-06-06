import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { LengthController } from './length.controller';
import { LengthValidation } from './length.validation';

const router = Router();

router.post(
  '/',
  auth('ADMIN'),
  validateRequest(LengthValidation.createLength),
  LengthController.createLength
);

router.get('/', LengthController.getAllLengths);

router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(LengthValidation.updateLength),
  LengthController.updateLength
);

router.delete(
  '/:id',
  auth('ADMIN'),
  LengthController.deleteLength
);

export const LengthRoutes = router;
