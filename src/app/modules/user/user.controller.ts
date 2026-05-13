import type { RequestHandler } from 'express';

import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

const getMe: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const userId = req.user.userId;
  const result = await UserService.getMe(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile retrieved successfully.',
    data: result
  });
});

const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.searchTerm as string | undefined;
  const salonId = req.query.salonId as string | undefined;

  const result = await UserService.getAllUsers({ searchTerm, salonId }, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const changeRole: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.changeRole(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User role updated successfully.',
    data: result
  });
});

const changeStatus: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.changeStatus(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User status updated to ${req.body.status} successfully.`,
    data: result
  });
});

export const UserController = {
  getMe,
  getAllUsers,
  changeRole,
  changeStatus
};
