import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import type { IPayrollFilterParams } from './payroll.interface';

function parsePayrollDateParts(dateString: string) {
  const normalized = dateString.trim();

  // Handle ISO format YYYY-MM-DD
  const isoDateOnlyMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnlyMatch) {
    return {
      year: Number(isoDateOnlyMatch[1]),
      month: Number(isoDateOnlyMatch[2]),
      day: Number(isoDateOnlyMatch[3])
    };
  }

  // Handle formats like MM/DD/YYYY or DD/MM/YYYY
  const slashDateMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashDateMatch) {
    const first = Number(slashDateMatch[1]);
    const second = Number(slashDateMatch[2]);
    const year = Number(slashDateMatch[3]);

    // Heuristic: if first > 12, it must be the day (DD/MM/YYYY)
    if (first > 12) {
      return { year, month: second, day: first };
    }
    // If second > 12, it must be the day (MM/DD/YYYY)
    if (second > 12) {
      return { year, month: first, day: second };
    }
    // Default to US format MM/DD/YYYY if both are <= 12
    return { year, month: first, day: second };
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid payroll date format: ${dateString}`);
  }

  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate()
  };
}

function buildUtcDayStart(dateString: string) {
  const { year, month, day } = parsePayrollDateParts(dateString);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function buildUtcDayEnd(dateString: string) {
  const { year, month, day } = parsePayrollDateParts(dateString);
  // Using 23:59:59.999 to cover the absolute end of the UTC day
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
}

const getAllPayroll = async (filters: IPayrollFilterParams) => {
  const andConditions: Prisma.SalonEntryWhereInput[] = [];

  // Robust date filtering for inclusive ranges
  if (filters.startDate) {
    const start = new Date(`${filters.startDate}T00:00:00.000Z`);
    if (!isNaN(start.getTime())) {
      andConditions.push({ createdAt: { gte: start } });
    }
  }

  if (filters.endDate) {
    const end = new Date(`${filters.endDate}T23:59:59.999Z`);
    if (!isNaN(end.getTime())) {
      andConditions.push({ createdAt: { lte: end } });
    }
  }

  if (filters.salonId) {
    andConditions.push({ salonId: filters.salonId });
  }

  // Search by service name
  if (filters.searchTerm) {
    const matchingServices = await prisma.service.findMany({
      where: { name: { contains: filters.searchTerm, mode: 'insensitive' } },
      select: { id: true }
    });
    const serviceIds = matchingServices.map((s) => s.id);
    andConditions.push({ serviceId: { in: serviceIds } });
  }

  const whereConditions: Prisma.SalonEntryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Find all matching entries with relations
  const matchingEntries = await prisma.salonEntry.findMany({
    where: whereConditions,
    include: {
      service: true,
      salon: true
    }
  });

  // Group and calculate (RESTORED AGGREGATION LOGIC)
  const payrollMap: Record<
    string,
    {
      serviceId: string;
      serviceName: string;
      salonId: string;
      salonName: string;
      totalOccurrences: number;
      totalIncome: number;
      totalTips: number;
    }
  > = {};

  matchingEntries.forEach((entry) => {
    const key = `${entry.serviceId}_${entry.salonId}`;
    if (!payrollMap[key]) {
      payrollMap[key] = {
        serviceId: entry.serviceId,
        serviceName: entry.service?.name || 'Unknown Service',
        salonId: entry.salonId,
        salonName: entry.salon?.name || 'Unknown Salon',
        totalOccurrences: 0,
        totalIncome: 0,
        totalTips: 0
      };
    }

    const netPrice = entry.totalPrice - (entry.addHair || 0);

    payrollMap[key].totalOccurrences += 1;
    payrollMap[key].totalIncome += netPrice;
    payrollMap[key].totalTips += entry.tips || 0;
  });

  // Convert map to array and sort by highest income
  const formattedData = Object.values(payrollMap).sort((a, b) => b.totalIncome - a.totalIncome);

  return formattedData;
};

export const PayrollService = {
  getAllPayroll
};
