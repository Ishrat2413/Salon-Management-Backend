import type { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ServiceService } from './service.service';

const createService: RequestHandler = catchAsync(async (req, res) => {
  const result = await ServiceService.createService(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Service created successfully.',
    data: result
  });
});

const getAllServices: RequestHandler = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.searchTerm as string | undefined;

  const result = await ServiceService.getAllServices({ searchTerm }, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Services retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const updateService: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceService.updateService(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service updated successfully.',
    data: result
  });
});

const deleteService: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceService.deleteService(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service deleted successfully.',
    data: result
  });
});

export const ServiceController = {
  createService,
  getAllServices,
  updateService,
  deleteService
};
