import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReportService } from './report.service';
const getWeeklyEmployeeEarnings = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getWeeklyEmployeeEarnings({
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Weekly employee earnings fetched successfully',
    data: result
  });
});

export const ReportController = {
  getWeeklyEmployeeEarnings
};
