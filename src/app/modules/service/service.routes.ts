import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ServiceController } from './service.controller';
import { ServiceValidation } from './service.validation';

const router = Router();

router.post(
  '/',
  auth('ADMIN'),
  validateRequest(ServiceValidation.createService),
  ServiceController.createService
);

router.get('/', ServiceController.getAllServices);

router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(ServiceValidation.updateService),
  ServiceController.updateService
);

router.delete(
  '/:id',
  auth('ADMIN'),
  ServiceController.deleteService
);

export const ServiceRoutes = router;
