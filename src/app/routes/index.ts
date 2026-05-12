import { Router } from 'express';

import { AuthRoutes } from '../modules/auth/auth.routes';
import { SalonRoutes } from '../modules/salon/salon.routes';
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
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
