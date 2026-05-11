import type { RequestHandler } from 'express';

import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const register: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully.',
    data: result
  });
});

const login: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully.',
    data: result
  });
});

const changePassword: RequestHandler = catchAsync(async (req, res) => {
  // `req.user` is set by the auth middleware
  if (!req.user) {
    throw new AppError(401, 'You are not authorized.');
  }
  const userId = req.user.userId;

  await AuthService.changePassword(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully.',
    data: null
  });
});

const forgotPassword: RequestHandler = catchAsync(async (req, res) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'If the email exists, a password reset code has been sent.',
    data: null
  });
});

const verifyResetCode: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.verifyResetCode(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Code verified successfully. You can now reset your password.',
    data: result // Contains the temporary reset token
  });
});

const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password has been reset successfully.',
    data: null
  });
});

export const AuthController = {
  register,
  login,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
};
