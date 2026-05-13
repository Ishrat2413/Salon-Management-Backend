import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SalonEntryController } from './salon-entry.controller';
import { SalonEntryValidation } from './salon-entry.validation';

const router = Router();

router.post(
  '/',
  auth('EMPLOYEE', 'MANAGER', 'ADMIN'),
  validateRequest(SalonEntryValidation.createSalonEntry),
  SalonEntryController.createSalonEntry
);

router.get(
  '/',
  auth('EMPLOYEE', 'MANAGER', 'ADMIN'),
  SalonEntryController.getAllSalonEntries
);

export const SalonEntryRoutes = router;
