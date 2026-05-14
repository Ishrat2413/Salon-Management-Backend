import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PayrollController } from './payroll.controller';

const router = Router();

router.get(
  '/',
  auth('ADMIN'),
  PayrollController.getAllPayroll
);

export const PayrollRoutes = router;
