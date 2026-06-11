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

export const ReportRoutes = router;
