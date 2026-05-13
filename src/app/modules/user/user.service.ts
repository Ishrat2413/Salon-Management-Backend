import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { IChangeRolePayload, IUserFilterParams } from './user.interface';

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      salonId: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  return user;
};

const getAllUsers = async (filters: IUserFilterParams, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  // We explicitly only want to return Employees and Managers, never Admins.
  const andConditions: Prisma.UserWhereInput[] = [
    { role: { in: ['EMPLOYEE', 'MANAGER'] } }
  ];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { fullName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { email: { contains: filters.searchTerm, mode: 'insensitive' } }
      ]
    });
  }

  if (filters.salonId) {
    andConditions.push({ salonId: filters.salonId });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const users = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  });

  const total = await prisma.user.count({
    where: whereConditions
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: users
  };
};

const changeRole = async (id: string, payload: IChangeRolePayload) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role: payload.role },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      salonId: true
    }
  });

  return updatedUser;
};

const changeStatus = async (id: string, payload: { status: 'PENDING' | 'ACTIVE' | 'SUSPEND' | 'REJECTED' }) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status: payload.status },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      salonId: true
    }
  });

  return updatedUser;
};

export const UserService = {
  getMe,
  getAllUsers,
  changeRole,
  changeStatus
};
