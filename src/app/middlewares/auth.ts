import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';
import AppError from '../errors/AppError';
import type { IAuthUser, UserRole } from '../interfaces/auth.interface';
import catchAsync from '../utils/catchAsync';
import prisma from '../utils/prisma';

const isAuthUser = (payload: unknown): payload is IAuthUser => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  const role = candidate.role as UserRole;

  return (
    typeof candidate.userId === 'string' &&
    typeof candidate.email === 'string' &&
    (role === 'EMPLOYEE' || role === 'MANAGER' || role === 'ADMIN')
  );
};

const auth = (...requiredRoles: UserRole[]): RequestHandler => {
  return catchAsync(async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError(401, 'Authorization token is missing.'));
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (_error) {
      return next(new AppError(401, 'Invalid or expired authorization token.'));
    }

    if (!isAuthUser(decoded)) {
      return next(new AppError(401, 'Invalid authorization token.'));
    }

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return next(new AppError(401, 'The user belonging to this token no longer exists.'));
    }

    // Prevent suspended or rejected users from continuing
    if (user.status === 'SUSPEND' || user.status === 'REJECTED') {
      return next(new AppError(403, 'Your account is disabled.'));
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
      return next(new AppError(403, 'You do not have permission to access this resource.'));
    }

    req.user = decoded;
    return next();
  });
};

export default auth;
