import { Router } from 'express';

import { AuthRoutes } from '../modules/auth/auth.routes';
import { PayrollRoutes } from '../modules/payroll/payroll.routes';
import { SalonRoutes } from '../modules/salon/salon.routes';
import { SalonEntryRoutes } from '../modules/salon-entry/salon-entry.routes';
import { ServiceRoutes } from '../modules/service/service.routes';
import { UserRoutes } from '../modules/user/user.routes';

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
    path: '/salons',
    route: SalonRoutes
  },
  {
    path: '/services',
    route: ServiceRoutes
  },
  {
    path: '/salon-entries',
    route: SalonEntryRoutes
  },
  {
    path: '/payroll',
    route: PayrollRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
