import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SalonController } from './salon.controller';
import { SalonValidation } from './salon.validation';

const router = Router();

router.post(
  '/',
  auth('ADMIN'),
  validateRequest(SalonValidation.createSalon),
  SalonController.createSalon
);

router.get('/', SalonController.getAllSalons);

router.get('/:id', SalonController.getSingleSalon);

router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(SalonValidation.updateSalon),
  SalonController.updateSalon
);

router.delete(
  '/:id',
  auth('ADMIN'),
  SalonController.deleteSalon
);

export const SalonRoutes = router;
