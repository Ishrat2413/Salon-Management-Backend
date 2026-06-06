import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { ISizeCreatePayload, ISizeUpdatePayload, ISizeFilterParams } from './size.interface';

const createSize = async (payload: ISizeCreatePayload) => {
  const result = await prisma.size.create({
    data: payload
  });
  return result;
};

const getAllSizes = async (filters: ISizeFilterParams, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const andConditions: Prisma.SizeWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      name: { contains: filters.searchTerm, mode: 'insensitive' }
    });
  }

  const whereConditions: Prisma.SizeWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.size.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { name: 'asc' }
  });

  const total = await prisma.size.count({
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

const updateSize = async (id: string, payload: ISizeUpdatePayload) => {
  const size = await prisma.size.findUnique({ where: { id } });

  if (!size) {
    throw new AppError(404, 'Size not found.');
  }

  const result = await prisma.size.update({
    where: { id },
    data: payload
  });

  return result;
};

const deleteSize = async (id: string) => {
  const size = await prisma.size.findUnique({ 
    where: { id },
    include: { _count: { select: { salonEntries: true } } }
  });

  if (!size) {
    throw new AppError(404, 'Size not found.');
  }

  if (size._count.salonEntries > 0) {
    throw new AppError(400, 'Cannot delete this size because it is currently being used in one or more salon entries.');
  }

  const result = await prisma.size.delete({
    where: { id }
  });

  return result;
};

export const SizeService = {
  createSize,
  getAllSizes,
  updateSize,
  deleteSize
};
