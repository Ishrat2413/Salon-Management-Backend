import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { ISalonCreatePayload, ISalonUpdatePayload, ISalonFilterParams } from './salon.interface';

const createSalon = async (payload: ISalonCreatePayload) => {
  if (payload.managerId) {
    const manager = await prisma.user.findUnique({ where: { id: payload.managerId } });
    if (!manager) {
      throw new AppError(404, 'Manager not found.');
    }
    if (manager.role !== 'MANAGER') {
      throw new AppError(400, 'Selected user is not a manager.');
    }
  }

  const result = await prisma.salon.create({
    data: payload
  });
  return result;
};

const getAllSalons = async (filters: ISalonFilterParams, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const andConditions: Prisma.SalonWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { address: { contains: filters.searchTerm, mode: 'insensitive' } }
      ]
    });
  }

  const whereConditions: Prisma.SalonWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.salon.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { name: 'asc' },
    include: {
      manager: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      users: {
        where: { role: 'MANAGER' },
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      _count: {
        select: { users: true }
      }
    }
  });

  const total = await prisma.salon.count({
    where: whereConditions
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
};

const getSingleSalon = async (id: string) => {
  const result = await prisma.salon.findUnique({
    where: { id },
    include: {
      manager: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      users: {
        where: { role: 'MANAGER' },
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      _count: {
        select: { users: true }
      }
    }
  });

  if (!result) {
    throw new AppError(404, 'Salon not found.');
  }

  return result;
};

const updateSalon = async (id: string, payload: ISalonUpdatePayload) => {
  const salon = await prisma.salon.findUnique({
    where: { id },
    select: {
      managerId: true,
      users: {
        where: { role: 'MANAGER' },
        select: { id: true }
      }
    }
  });

  if (!salon) {
    throw new AppError(404, 'Salon not found.');
  }

  // Handle individual primary manager assignment if provided
  if (payload.managerId !== undefined) {
    if (salon.managerId && salon.managerId !== payload.managerId) {
      await prisma.user.update({
        where: { id: salon.managerId },
        data: { salonId: null }
      });
    }

    if (payload.managerId) {
      const manager = await prisma.user.findUnique({ where: { id: payload.managerId } });
      if (!manager || manager.role !== 'MANAGER') {
        throw new AppError(400, 'Invalid manager selected.');
      }
      await prisma.user.update({
        where: { id: payload.managerId },
        data: { salonId: id }
      });
    }
  }

  // Handle multi-manager synchronization if managerIds array is provided
  if (payload.managerIds) {
    // Current managers linked to this salon
    const currentManagerIds = salon.users.map(u => u.id);
    
    // IDs to add (present in payload but not in DB)
    const toAdd = payload.managerIds.filter(mid => !currentManagerIds.includes(mid));
    
    // IDs to remove (present in DB but not in payload)
    const toRemove = currentManagerIds.filter(mid => !payload.managerIds!.includes(mid));

    // If the primary manager is being removed from the list, clear the primary managerId
    if (salon.managerId && toRemove.includes(salon.managerId)) {
      payload.managerId = null as any; // Clear primary manager
    }

    // Perform updates
    await Promise.all([
      // Connect new managers
      ...toAdd.map(mid => prisma.user.update({
        where: { id: mid },
        data: { salonId: id }
      })),
      // Disconnect removed managers
      ...toRemove.map(mid => prisma.user.update({
        where: { id: mid },
        data: { salonId: null }
      }))
    ]);
  }

  // Final update for basic salon details (name, address, etc.)
  const { managerIds, ...basicData } = payload;
  const result = await prisma.salon.update({
    where: { id },
    data: basicData,
    include: {
      manager: true,
      users: { where: { role: 'MANAGER' } }
    }
  });

  return result;
};

const deleteSalon = async (id: string) => {
  const salon = await prisma.salon.findUnique({ 
    where: { id },
    include: { _count: { select: { users: true, salonEntries: true } } }
  });

  if (!salon) {
    throw new AppError(404, 'Salon not found.');
  }

  if (salon._count.users > 0) {
    throw new AppError(400, 'Cannot delete this salon because it has employees or managers assigned to it.');
  }

  if (salon._count.salonEntries > 0) {
    throw new AppError(400, 'Cannot delete this salon because it is currently being used in one or more salon entries.');
  }

  const result = await prisma.salon.delete({
    where: { id }
  });

  return result;
};

export const SalonService = {
  createSalon,
  getAllSalons,
  getSingleSalon,
  updateSalon,
  deleteSalon
};
