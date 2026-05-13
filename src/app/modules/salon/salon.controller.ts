import type { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SalonService } from './salon.service';

const createSalon: RequestHandler = catchAsync(async (req, res) => {
  const result = await SalonService.createSalon(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Salon created successfully.',
    data: result
  });
});

const getAllSalons: RequestHandler = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.searchTerm as string | undefined;

  const result = await SalonService.getAllSalons({ searchTerm }, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salons retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const getSingleSalon: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SalonService.getSingleSalon(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salon retrieved successfully.',
    data: result
  });
});

const updateSalon: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SalonService.updateSalon(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salon updated successfully.',
    data: result
  });
});

const deleteSalon: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SalonService.deleteSalon(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salon deleted successfully.',
    data: result
  });
});

export const SalonController = {
  createSalon,
  getAllSalons,
  getSingleSalon,
  updateSalon,
  deleteSalon
};
