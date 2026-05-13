import type { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SalonEntryService } from './salon-entry.service';
import AppError from '../../errors/AppError';

const createSalonEntry: RequestHandler = catchAsync(async (req, res) => {
  const result = await SalonEntryService.createSalonEntry(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Salon entry created successfully.',
    data: result
  });
});

const getAllSalonEntries: RequestHandler = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.searchTerm as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const employeeId = req.query.employeeId as string | undefined;
  const salonId = req.query.salonId as string | undefined;
  
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const userId = req.user.userId;
  const role = req.user.role;

  const result = await SalonEntryService.getAllSalonEntries(
    userId, 
    role, 
    { searchTerm, startDate, endDate, employeeId, salonId }, 
    page, 
    limit
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salon entries retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

export const SalonEntryController = {
  createSalonEntry,
  getAllSalonEntries
};
