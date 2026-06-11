import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ReportController } from './report.controller';

console.log('Loading ReportRoutes...');
const router = Router();

router.get(
  '/employee-earnings',
  auth('ADMIN', 'MANAGER'),
  ReportController.getWeeklyEmployeeEarnings
);

router.get(
  '/salon-revenue',
  auth('ADMIN', 'MANAGER'),
  ReportController.getSalonRevenue
);

router.get(
  '/top-services',
  auth('ADMIN', 'MANAGER'),
  ReportController.getTopServices
);

export const ReportRoutes = router;
