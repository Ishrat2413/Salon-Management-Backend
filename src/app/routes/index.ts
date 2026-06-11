import { Router } from 'express';

import { AuthRoutes } from '../modules/auth/auth.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { PayrollRoutes } from '../modules/payroll/payroll.routes';
import { SalonRoutes } from '../modules/salon/salon.routes';
import { SalonEntryRoutes } from '../modules/salon-entry/salon-entry.routes';
import { ServiceRoutes } from '../modules/service/service.routes';
import { SizeRoutes } from '../modules/size/size.routes';
import { LengthRoutes } from '../modules/length/length.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { TaskRoutes } from '../modules/task/task.routes';
import { ReportRoutes } from '../modules/report/report.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes
  },
  {
    path: '/users',
    route: UserRoutes
  },
  {
    path: '/dashboard',
    route: DashboardRoutes
  },
  {
    path: '/salons',
    route: SalonRoutes
  },
  {
    path: '/services',
    route: ServiceRoutes
  },
  {
    path: '/sizes',
    route: SizeRoutes
  },
  {
    path: '/lengths',
    route: LengthRoutes
  },
  {
    path: '/salon-entries',
    route: SalonEntryRoutes
  },
  {
    path: '/payroll',
    route: PayrollRoutes
  },
  {
    path: '/tasks',
    route: TaskRoutes
  },
  {
    path: '/reports',
    route: ReportRoutes
  }
];

moduleRoutes.forEach((route) => {
  console.log(`Registering route: ${route.path}`);
  router.use(route.path, route.route);
});

export default router;
