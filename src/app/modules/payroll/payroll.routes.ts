import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PayrollController } from './payroll.controller';

const router = Router();

router.get(
  '/',
  auth('ADMIN'),
  PayrollController.getAllPayroll
);

router.get(
  '/employee/:employeeId/entries',
  auth('ADMIN'),
  PayrollController.getEmployeePayrollEntries
);

export const PayrollRoutes = router;
