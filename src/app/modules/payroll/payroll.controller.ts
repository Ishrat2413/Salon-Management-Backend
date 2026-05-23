import type { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PayrollService } from './payroll.service';

const getAllPayroll: RequestHandler = catchAsync(async (req, res) => {
  const searchTerm = req.query.searchTerm as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const employeeId = req.query.employeeId as string | undefined;

  const result = await PayrollService.getAllPayroll({ searchTerm, startDate, endDate, employeeId });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payroll retrieved successfully.',
    data: result
  });
});

export const PayrollController = {
  getAllPayroll
};
