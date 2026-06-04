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
      phoneNumber: true,
      address: true,
      salonId: true,
      salon: {
        select: {
          name: true,
          address: true
        }
      },
      commissionRate: {
        select: {
          rate: true
        }
      },
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  return user;
};

const updateProfile = async (
  userId: string,
  payload: { fullName?: string; phoneNumber?: string; address?: string }
) => {
  const data = {
    ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
    ...(payload.phoneNumber !== undefined ? { phoneNumber: payload.phoneNumber } : {}),
    ...(payload.address !== undefined ? { address: payload.address } : {})
  };

  const result = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      phoneNumber: true,
      address: true,
      salonId: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return result;
};

const getAllUsers = async (filters: IUserFilterParams, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (filters.role) {
    if (typeof filters.role === 'string') {
      const rolesArray = filters.role.split(',').map((r) => r.trim());
      andConditions.push({ role: { in: rolesArray as any[] } });
    } else {
      andConditions.push({ role: filters.role as any });
    }
  } else {
    // Default behavior: Include all users
    andConditions.push({ role: { in: ['EMPLOYEE', 'MANAGER', 'ADMIN'] } });
  }

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

  if (filters.status) {
    if (typeof filters.status === 'string' && filters.status.includes(',')) {
      const statusArray = filters.status.split(',').map((s) => s.trim());
      andConditions.push({ status: { in: statusArray as any[] } });
    } else {
      andConditions.push({ status: filters.status as any });
    }
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
      },
      commissionRate: {
        select: {
          rate: true
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
    salonName: user.salon?.name || 'N/A',
    commissionRate: user.commissionRate?.rate ?? null
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

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
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

    if (payload.commissionRate !== undefined) {
      await tx.commissionRate.upsert({
        where: { userId: id },
        update: { rate: payload.commissionRate },
        create: {
          userId: id,
          rate: payload.commissionRate
        }
      });
    }

    return updatedUser;
  });

  // Fetch updated user with commission rate to return
  const finalUser = await prisma.user.findUnique({
    where: { id: result.id },
    include: { commissionRate: true }
  });

  return {
    ...result,
    commissionRate: finalUser?.commissionRate?.rate ?? null
  };
};

const updateCommissionRate = async (id: string, payload: { commissionRate: number }) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const result = await prisma.commissionRate.upsert({
    where: { userId: id },
    update: { rate: payload.commissionRate },
    create: {
      userId: id,
      rate: payload.commissionRate
    }
  });

  return result;
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  // Use a transaction to safely clean up all associated records before deleting the user
  const result = await prisma.$transaction(async (tx) => {
    // 1. Remove the user as a manager from any salon (if applicable)
    if (user.role === 'MANAGER') {
      await tx.salon.updateMany({
        where: { managerId: id },
        data: { managerId: null }
      });
    }

    // 2. Delete any split entries where this user is the split employee
    await tx.splitEntry.deleteMany({
      where: { employeeId: id }
    });

    // 3. Delete any main salon entries where this user is the primary employee
    // (Note: Database-level cascade will automatically remove child split entries

    // for these salon entries if setup, but we use deleteMany safely here regardless)
    await tx.salonEntry.deleteMany({
      where: { employeeId: id }
    });

    // 4. Finally, delete the user
    return tx.user.delete({
      where: { id }
    });
  });

  return result;
};

export const UserService = {
  getMe,
  updateProfile,
  getAllUsers,
  changeRole,
  changeStatus,
  updateCommissionRate,
  deleteUser
};
