import type { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SizeService } from './size.service';

const createSize: RequestHandler = catchAsync(async (req, res) => {
  const result = await SizeService.createSize(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Size created successfully.',
    data: result
  });
});

const getAllSizes: RequestHandler = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.searchTerm as string | undefined;

  const result = await SizeService.getAllSizes({ searchTerm }, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sizes retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const updateSize: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SizeService.updateSize(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Size updated successfully.',
    data: result
  });
});

const deleteSize: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SizeService.deleteSize(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Size deleted successfully.',
    data: result
  });
});

export const SizeController = {
  createSize,
  getAllSizes,
  updateSize,
  deleteSize
};
