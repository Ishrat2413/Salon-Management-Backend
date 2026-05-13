import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import type { ISalonEntryCreatePayload } from './salon-entry.interface';

const createSalonEntry = async (payload: ISalonEntryCreatePayload) => {
  const { splits, ...entryData } = payload;
  
  const result = await prisma.$transaction(async (tx) => {
    const salonEntry = await tx.salonEntry.create({
      data: {
        ...entryData,
        splits: entryData.isSplit && splits && splits.length > 0 ? {
          create: splits.map(split => ({
            employeeId: split.employeeId,
            totalPrice: split.totalPrice,
            tips: split.tips || 0
          }))
        } : undefined
      },
      include: {
        splits: true
      }
    });

    return salonEntry;
  });

  return result;
};

const getAllSalonEntries = async (userId: string, role: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const result = await prisma.salonEntry.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { id: true, name: true } },
      salon: { select: { id: true, name: true } },
      splits: true
    }
  });

  const total = await prisma.salonEntry.count();

  const formattedData = result.map(entry => {
    let loggedInUserTips = 0;
    if (entry.employeeId === userId) {
      loggedInUserTips = entry.tips || 0;
    } else if (entry.isSplit && entry.splits) {
      const userSplit = entry.splits.find(s => s.employeeId === userId);
      if (userSplit) {
        loggedInUserTips = userSplit.tips || 0;
      }
    }

    return {
      id: entry.id,
      serviceId: entry.serviceId,
      serviceName: entry.service.name,
      salonId: entry.salonId,
      salonName: entry.salon.name,
      createdAt: entry.createdAt,
      totalPrice: entry.totalPrice,
      loggedInUserTips,
      isSplit: entry.isSplit
    };
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: formattedData
  };
};

export const SalonEntryService = {
  createSalonEntry,
  getAllSalonEntries
};
