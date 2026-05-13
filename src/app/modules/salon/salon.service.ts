import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { ISalonCreatePayload, ISalonUpdatePayload, ISalonFilterParams } from './salon.interface';

const createSalon = async (payload: ISalonCreatePayload) => {
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
  const salon = await prisma.salon.findUnique({ where: { id } });

  if (!salon) {
    throw new AppError(404, 'Salon not found.');
  }

  const result = await prisma.salon.update({
    where: { id },
    data: payload
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
