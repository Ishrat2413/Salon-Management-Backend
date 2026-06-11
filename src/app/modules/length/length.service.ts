import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { ILengthCreatePayload, ILengthUpdatePayload, ILengthFilterParams } from './length.interface';

const createLength = async (payload: ILengthCreatePayload) => {
  const result = await prisma.length.create({
    data: payload
  });
  return result;
};

const getAllLengths = async (filters: ILengthFilterParams, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const andConditions: Prisma.LengthWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      name: { contains: filters.searchTerm, mode: 'insensitive' }
    });
  }

  const whereConditions: Prisma.LengthWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.length.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { name: 'asc' }
  });

  const total = await prisma.length.count({
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

const updateLength = async (id: string, payload: ILengthUpdatePayload) => {
  const length = await prisma.length.findUnique({ where: { id } });

  if (!length) {
    throw new AppError(404, 'Length not found.');
  }

  const result = await prisma.length.update({
    where: { id },
    data: payload
  });

  return result;
};

const deleteLength = async (id: string) => {
  const length = await prisma.length.findUnique({ 
    where: { id },
    include: { _count: { select: { salonEntries: true } } }
  });

  if (!length) {
    throw new AppError(404, 'Length not found.');
  }

  if (length._count.salonEntries > 0) {
    throw new AppError(400, 'Cannot delete this length because it is currently being used in one or more salon entries.');
  }

  const result = await prisma.length.delete({
    where: { id }
  });

  return result;
};

export const LengthService = {
  createLength,
  getAllLengths,
  updateLength,
  deleteLength
};
