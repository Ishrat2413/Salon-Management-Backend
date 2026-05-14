import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import type { ISalonEntryCreatePayload, ISalonEntryFilterParams } from './salon-entry.interface';

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

const getAllSalonEntries = async (
  userId: string, 
  role: string, 
  filters: ISalonEntryFilterParams, 
  page: number, 
  limit: number
) => {
  const skip = (page - 1) * limit;
  const andConditions: Prisma.SalonEntryWhereInput[] = [];

  // 1. RBAC Conditions
  if (role === 'EMPLOYEE') {
    andConditions.push({
      OR: [
        { employeeId: userId },
        { splits: { some: { employeeId: userId } } }
      ]
    });
  } else if (role === 'MANAGER') {
    const managerUser = await prisma.user.findUnique({ where: { id: userId } });
    if (managerUser?.salonId) {
      andConditions.push({ salonId: managerUser.salonId });
    } else {
      // If manager has no salon assigned, they see nothing
      andConditions.push({ id: 'none' }); 
    }
  }
  // ADMIN has no RBAC restrictions

  // 2. Filter Conditions
  if (filters.startDate && filters.endDate) {
    const end = new Date(filters.endDate);
    end.setUTCHours(23, 59, 59, 999);
    andConditions.push({
      createdAt: {
        gte: new Date(filters.startDate),
        lte: end
      }
    });
  } else if (filters.startDate) {
    andConditions.push({ createdAt: { gte: new Date(filters.startDate) } });
  } else if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setUTCHours(23, 59, 59, 999);
    andConditions.push({ createdAt: { lte: end } });
  }

  if (filters.employeeId) {
    andConditions.push({
      OR: [
        { employeeId: filters.employeeId },
        { splits: { some: { employeeId: filters.employeeId } } }
      ]
    });
  }

  if (filters.salonId) {
    andConditions.push({ salonId: filters.salonId });
  }

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { notes: { contains: filters.searchTerm, mode: 'insensitive' } },
        { service: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { salon: { name: { contains: filters.searchTerm, mode: 'insensitive' } } }
      ]
    });
  }

  const whereConditions: Prisma.SalonEntryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 3. Fetch Paginated Data
  const result = await prisma.salonEntry.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { id: true, name: true } },
      salon: { select: { id: true, name: true } },
      splits: true
    }
  });

  const total = await prisma.salonEntry.count({
    where: whereConditions
  });

  // Calculate metadata via raw aggregation to get dataset totals
  const allMatchingEntries = await prisma.salonEntry.findMany({
    where: whereConditions,
    select: {
      employeeId: true,
      totalPrice: true,
      tips: true,
      isSplit: true,
      splits: { select: { employeeId: true, totalPrice: true, tips: true } }
    }
  });

  let totalPrices = 0;
  let totalTips = 0;
  let loggedInUserPrices = 0;
  let loggedInUserTipsMeta = 0;

  allMatchingEntries.forEach(entry => {
    totalPrices += entry.totalPrice;
    totalTips += (entry.tips || 0);

    let rowLoggedInUserTips = 0;
    let rowLoggedInUserTotalPrice = 0;

    if (entry.employeeId === userId) {
      rowLoggedInUserTips = entry.tips || 0;
      rowLoggedInUserTotalPrice = entry.totalPrice;

      if (entry.isSplit && entry.splits && entry.splits.length > 0) {
        const splitTipsSum = entry.splits.reduce((sum, split) => sum + (split.tips || 0), 0);
        const splitPriceSum = entry.splits.reduce((sum, split) => sum + split.totalPrice, 0);
        
        rowLoggedInUserTips -= splitTipsSum;
        rowLoggedInUserTotalPrice -= splitPriceSum;
      }
    } else if (entry.isSplit && entry.splits) {
      const userSplit = entry.splits.find(s => s.employeeId === userId);
      if (userSplit) {
        rowLoggedInUserTips = userSplit.tips || 0;
        rowLoggedInUserTotalPrice = userSplit.totalPrice;
      }
    }

    loggedInUserPrices += rowLoggedInUserTotalPrice;
    loggedInUserTipsMeta += rowLoggedInUserTips;
  });

  const formattedData = result.map(entry => {
    let loggedInUserTips = 0;
    let loggedInUserTotalPrice = 0;

    if (entry.employeeId === userId) {
      loggedInUserTips = entry.tips || 0;
      loggedInUserTotalPrice = entry.totalPrice;

      if (entry.isSplit && entry.splits && entry.splits.length > 0) {
        const splitTipsSum = entry.splits.reduce((sum, split) => sum + (split.tips || 0), 0);
        const splitPriceSum = entry.splits.reduce((sum, split) => sum + split.totalPrice, 0);
        
        loggedInUserTips -= splitTipsSum;
        loggedInUserTotalPrice -= splitPriceSum;
      }
    } else if (entry.isSplit && entry.splits) {
      const userSplit = entry.splits.find(s => s.employeeId === userId);
      if (userSplit) {
        loggedInUserTips = userSplit.tips || 0;
        loggedInUserTotalPrice = userSplit.totalPrice;
      }
    }

    return {
      id: entry.id,
      clientName: entry.clientName,
      serviceId: entry.serviceId,
      serviceName: entry.service.name,
      salonId: entry.salonId,
      salonName: entry.salon.name,
      createdAt: entry.createdAt,
      totalPrice: entry.totalPrice,
      tips: entry.tips || 0,
      loggedInUserTotalPrice,
      loggedInUserTips,
      isSplit: entry.isSplit
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPrices,
      totalTips,
      loggedInUserPrices,
      loggedInUserTips: loggedInUserTipsMeta
    },
    data: formattedData
  };
};

export const SalonEntryService = {
  createSalonEntry,
  getAllSalonEntries
};
