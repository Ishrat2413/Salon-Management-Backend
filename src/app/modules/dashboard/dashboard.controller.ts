import type { RequestHandler } from 'express';

import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardService } from './dashboard.service';

const getOverview: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const period = req.query.period as string | undefined;
  const result = await DashboardService.getOverview(req.user.userId, req.user.role, period);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard overview retrieved successfully.',
    data: result
  });
});

export const DashboardController = {
  getOverview
};
