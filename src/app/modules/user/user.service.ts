import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { IChangeRolePayload } from './user.interface';

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

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
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

  return users;
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

export const UserService = {
  getMe,
  getAllUsers,
  changeRole
};
