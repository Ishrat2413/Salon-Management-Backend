import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import type { IPayrollFilterParams } from './payroll.interface';

const getAllPayroll = async (filters: IPayrollFilterParams) => {
  const andConditions: Prisma.SalonEntryWhereInput[] = [];

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

  if (filters.salonId) {
    andConditions.push({ salonId: filters.salonId });
  }

  // To search by service name, we first need to find matching service IDs
  if (filters.searchTerm) {
    const matchingServices = await prisma.service.findMany({
      where: { name: { contains: filters.searchTerm, mode: 'insensitive' } },
      select: { id: true }
    });
    const serviceIds = matchingServices.map(s => s.id);
    andConditions.push({ serviceId: { in: serviceIds } });
  }

  const whereConditions: Prisma.SalonEntryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Find all matching entries
  const matchingEntries = await prisma.salonEntry.findMany({
    where: whereConditions,
    include: {
      service: true,
      salon: true
    }
  });

  // Group and calculate manually
  const payrollMap: Record<
    string,
    { serviceId: string; serviceName: string; salonId: string; salonName: string; totalOccurrences: number; totalIncome: number; totalTips: number }
  > = {};

  matchingEntries.forEach(entry => {
    const key = `${entry.serviceId}_${entry.salonId}`;
    if (!payrollMap[key]) {
      payrollMap[key] = {
        serviceId: entry.serviceId,
        serviceName: entry.service.name,
        salonId: entry.salonId,
        salonName: entry.salon.name,
        totalOccurrences: 0,
        totalIncome: 0,
        totalTips: 0
      };
    }

    const netPrice = entry.totalPrice - (entry.addHair || 0);

    payrollMap[key].totalOccurrences += 1;
    payrollMap[key].totalIncome += netPrice;
    payrollMap[key].totalTips += (entry.tips || 0);
  });

  // Convert map to array and sort by highest income
  const formattedData = Object.values(payrollMap).sort((a, b) => b.totalIncome - a.totalIncome);

  return formattedData;
};

export const PayrollService = {
  getAllPayroll
};
