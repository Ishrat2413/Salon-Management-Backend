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

router.get('/', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), SalonEntryController.getAllSalonEntries);

router.get('/:id', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), SalonEntryController.getSingleSalonEntry);

router.patch(
  '/:id/status',
  auth('MANAGER', 'ADMIN'),
  validateRequest(SalonEntryValidation.changeStatus),
  SalonEntryController.changeStatus
);

router.patch(
  '/:id',
  auth('MANAGER', 'ADMIN'),
  validateRequest(SalonEntryValidation.updateSalonEntry),
  SalonEntryController.updateSalonEntry
);

router.delete('/:id', auth('MANAGER', 'ADMIN'), SalonEntryController.deleteSalonEntry);

export const SalonEntryRoutes = router;
