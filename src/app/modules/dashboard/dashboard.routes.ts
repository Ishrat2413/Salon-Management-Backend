import { Router } from 'express';

import auth from '../../middlewares/auth';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.get('/overview', auth('EMPLOYEE', 'MANAGER', 'ADMIN'), DashboardController.getOverview);

export const DashboardRoutes = router;
