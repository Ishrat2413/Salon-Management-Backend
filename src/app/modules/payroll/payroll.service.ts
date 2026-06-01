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

import { SalonEntryService } from '../salon-entry/salon-entry.service';
import { fromZonedTime } from 'date-fns-tz';

const getAllPayroll = async (filters: IPayrollFilterParams) => {
  const userConditions: Prisma.UserWhereInput[] = [
    { role: { in: ['EMPLOYEE', 'MANAGER'] } }
  ];

  if (filters.searchTerm) {
    userConditions.push({
      fullName: { contains: filters.searchTerm, mode: 'insensitive' }
    });
  }

  if (filters.employeeId) {
    userConditions.push({ id: filters.employeeId });
  }

  const users = await prisma.user.findMany({
    where: { AND: userConditions },
    include: {
      commissionRate: true,
      salon: true
    }
  });

  const entryFilter: Prisma.SalonEntryWhereInput = {
    status: 'APPROVED'
  };

  if (filters.startDate || filters.endDate) {
    entryFilter.createdAt = {};
    if (filters.startDate) {
      entryFilter.createdAt.gte = fromZonedTime(`${filters.startDate}T00:00:00`, 'America/Chicago');
    }
    if (filters.endDate) {
      entryFilter.createdAt.lte = fromZonedTime(`${filters.endDate}T23:59:59.999`, 'America/Chicago');
    }
  }

  // Fetch all APPROVED SalonEntries within the date range
  const entries = await prisma.salonEntry.findMany({
    where: entryFilter,
    include: {
      splits: true
    }
  });

  const payrollData = users.map((user) => {
    let totalOccurrences = 0;
    let serviceCharge = 0;
    let totalTips = 0;
    let commissionEarnings = 0;

    // Calculate metrics from entries
    entries.forEach(entry => {
      let isParticipant = false;

      if (entry.employeeId === user.id) {
        isParticipant = true;
        
        let ownServiceCharge = entry.totalPrice - (entry.addHair || 0);
        let ownTips = entry.tips || 0;

        if (entry.isSplit && entry.splits) {
           // Only subtract splits belonging to OTHER employees
           const otherSplits = entry.splits.filter(s => s.employeeId !== user.id);
           const splitServiceSum = otherSplits.reduce((sum, s) => sum + s.totalPrice, 0);
           const splitTipsSum = otherSplits.reduce((sum, s) => sum + (s.tips || 0), 0);
           
           ownServiceCharge -= splitServiceSum;
           ownTips -= splitTipsSum;
        }
        
        serviceCharge += ownServiceCharge;
        totalTips += ownTips;
        commissionEarnings += entry.commissionEarnings || 0;

      } else if (entry.isSplit && entry.splits) {
        const userSplit = entry.splits.find(s => s.employeeId === user.id);
        if (userSplit) {
          isParticipant = true;
          serviceCharge += userSplit.totalPrice;
          totalTips += (userSplit.tips || 0);
          commissionEarnings += userSplit.commissionEarnings || 0;
        }
      }

      if (isParticipant) {
        totalOccurrences += 1;
      }
    });

    // Calculate effective commission rate based on historical earnings
    let effectiveCommissionRate = user.commissionRate?.rate || 0;
    if (serviceCharge > 0) {
      effectiveCommissionRate = Math.round((commissionEarnings / serviceCharge) * 100);
    }

    const earnings = commissionEarnings + totalTips;

    return {
      employeeId: user.id,
      employeeName: user.fullName,
      salonName: user.salon?.name || 'N/A',
      totalOccurrences,
      commissionRate: effectiveCommissionRate,
      serviceCharge,
      commissionEarnings,
      totalTips,
      earnings
    };
  });

  // Filter out employees with no occurrences if you want, or show everyone.
  // The instructions said "show all employee and manager with there details". So we show all.
  return payrollData.sort((a, b) => b.earnings - a.earnings);
};

const getEmployeePayrollEntries = async (employeeId: string, filters: IPayrollFilterParams) => {
  return SalonEntryService.getAllSalonEntries(
    employeeId,
    'EMPLOYEE', 
    {
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: 'APPROVED',
      employeeId: employeeId
    },
    1,
    1000
  );
};

export const PayrollService = {
  getAllPayroll,
  getEmployeePayrollEntries
};
