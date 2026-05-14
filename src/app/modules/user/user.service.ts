import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { IChangeRolePayload, IChangeStatusPayload, IUserFilterParams } from './user.interface';

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
  const andConditions: Prisma.UserWhereInput[] = [{ role: { in: ['EMPLOYEE', 'MANAGER'] } }];

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
      role: true,
      status: true,
      salonId: true,
      salon: {
        select: {
          name: true
        }
      }
    }
  });

  const total = await prisma.user.count({
    where: whereConditions
  });

  const formattedUsers = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    salonId: user.salonId,
    salonName: user.salon?.name || 'N/A'
  }));

  return {
    meta: {
      page,
      limit,
      total
    },
    data: formattedUsers
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

const changeStatus = async (id: string, payload: IChangeStatusPayload) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  if (user.status === 'PENDING' && payload.status === 'REJECTED') {
    const deletedUser = await prisma.user.delete({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        salonId: true
      }
    });

    return deletedUser;
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

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          mainEntries: true,
          splitEntries: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  if (user._count.mainEntries > 0 || user._count.splitEntries > 0) {
    throw new AppError(400, 'Cannot delete this user because they are currently associated with one or more salon entries.');
  }

  const result = await prisma.user.delete({
    where: { id }
  });

  return result;
};

export const UserService = {
  getMe,
  getAllUsers,
  changeRole,
  changeStatus,
  deleteUser
};
