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

const updateProfile: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const userId = req.user.userId;
  const result = await UserService.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully.',
    data: result
  });
});

const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = req.query.searchTerm as string | undefined;
  const salonId = req.query.salonId as string | undefined;
  const role = req.query.role as any;
  const status = req.query.status as string | undefined;

  const result = await UserService.getAllUsers({ searchTerm, salonId, role, status }, page, limit);

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
  const isRejectedRemoval = req.body.status === 'REJECTED' && result.status === 'PENDING';

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: isRejectedRemoval
      ? 'User rejected and removed successfully.'
      : `User status updated to ${req.body.status} successfully.`,
    data: result
  });
});

const updateCommissionRate: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.updateCommissionRate(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Commission rate updated successfully.',
    data: result
  });
});

const deleteUser: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully.',
    data: result
  });
});

const deleteMe: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }

  const userId = req.user.userId;
  const result = await UserService.deleteUser(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your account has been deleted successfully.',
    data: result
  });
});

export const UserController = {
  getMe,
  updateProfile,
  getAllUsers,
  changeRole,
  changeStatus,
  updateCommissionRate,
  deleteUser,
  deleteMe
};
