import type { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { LengthService } from './length.service';

const createLength: RequestHandler = catchAsync(async (req, res) => {
  const result = await LengthService.createLength(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Length created successfully.',
    data: result
  });
});

const getAllLengths: RequestHandler = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.searchTerm as string | undefined;

  const result = await LengthService.getAllLengths({ searchTerm }, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Lengths retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const updateLength: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await LengthService.updateLength(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Length updated successfully.',
    data: result
  });
});

const deleteLength: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await LengthService.deleteLength(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Length deleted successfully.',
    data: result
  });
});

export const LengthController = {
  createLength,
  getAllLengths,
  updateLength,
  deleteLength
};
