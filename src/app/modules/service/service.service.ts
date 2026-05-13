import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type { IServiceCreatePayload, IServiceUpdatePayload, IServiceFilterParams } from './service.interface';

const createService = async (payload: IServiceCreatePayload) => {
  const result = await prisma.service.create({
    data: payload
  });
  return result;
};

const getAllServices = async (filters: IServiceFilterParams, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const andConditions: Prisma.ServiceWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      name: { contains: filters.searchTerm, mode: 'insensitive' }
    });
  }

  const whereConditions: Prisma.ServiceWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.service.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { name: 'asc' }
  });

  const total = await prisma.service.count({
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

const updateService = async (id: string, payload: IServiceUpdatePayload) => {
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    throw new AppError(404, 'Service not found.');
  }

  const result = await prisma.service.update({
    where: { id },
    data: payload
  });

  return result;
};

const deleteService = async (id: string) => {
  const service = await prisma.service.findUnique({ 
    where: { id },
    include: { _count: { select: { salonEntries: true } } }
  });

  if (!service) {
    throw new AppError(404, 'Service not found.');
  }

  if (service._count.salonEntries > 0) {
    throw new AppError(400, 'Cannot delete this service because it is currently being used in one or more salon entries.');
  }

  const result = await prisma.service.delete({
    where: { id }
  });

  return result;
};

export const ServiceService = {
  createService,
  getAllServices,
  updateService,
  deleteService
};
