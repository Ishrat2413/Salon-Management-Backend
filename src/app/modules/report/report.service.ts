import { Prisma } from '@prisma/client';
import { format, startOfWeek, endOfWeek, subWeeks, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import prisma from '../../utils/prisma';
import { WeeklyEarningsResponse } from './report.interface';

const TIMEZONE = 'America/Chicago';

const getWeeklyEmployeeEarnings = async (filters: {
  startDate?: string;
  endDate?: string;
}): Promise<WeeklyEarningsResponse> => {
  console.log('ReportService filters:', filters);
  const now = toZonedTime(new Date(), TIMEZONE);

  const isFilterEmpty = !filters.startDate || !filters.endDate;

  const currentStart = !isFilterEmpty
    ? toZonedTime(`${filters.startDate}T00:00:00.000`, TIMEZONE)
    : startOfWeek(now, { weekStartsOn: 1 });
  currentStart.setHours(0, 0, 0, 0);

  const currentEnd = !isFilterEmpty
    ? toZonedTime(`${filters.endDate}T23:59:59.999`, TIMEZONE)
    : endOfWeek(now, { weekStartsOn: 1 });
  currentEnd.setHours(23, 59, 59, 999);

  // Previous Week calculation remains relative to the *default* current week or the calculated range
  // For simplicity when filtering, we compare against the same range shifted back
  const rangeDuration = currentEnd.getTime() - currentStart.getTime();
  const prevStart = new Date(currentStart.getTime() - rangeDuration - 1);
  const prevEnd = new Date(currentStart.getTime() - 1);

  const fetchEarningsForRange = async (start: Date, end: Date) => {
    const entries = await prisma.salonEntry.findMany({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        createdAt: true,
        commissionEarnings: true,
        tips: true,
        splits: {
          select: {
            commissionEarnings: true
          }
        }
      }
    });
    console.log(`Entries for range ${start.toISOString()} to ${end.toISOString()}:`, entries.length);
    return entries;
  };

  const currentEntries = await fetchEarningsForRange(currentStart, currentEnd);
  console.log('Current Entries Sample:', currentEntries[0]);
  const prevEntries = await fetchEarningsForRange(prevStart, prevEnd);

  const calculateTotal = (entries: any[]) => {
    return entries.reduce((sum, entry) => {
      const mainEarnings = entry.commissionEarnings || 0;
      const tips = entry.tips || 0;
      const splitEarnings = entry.splits.reduce(
        (s: number, split: any) => s + (split.commissionEarnings || 0),
        0
      );
      return sum + mainEarnings + tips + splitEarnings;
    }, 0);
  };

  const currentTotal = calculateTotal(currentEntries);
  const prevTotal = calculateTotal(prevEntries);

  // Group by day for current week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyEarnings = days.map((day, index) => {
    const dayStart = addDays(currentStart, index);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEntries = currentEntries.filter((entry) => {
      const entryDate = toZonedTime(entry.createdAt, TIMEZONE);
      return entryDate >= dayStart && entryDate <= dayEnd;
    });

    return {
      day,
      earnings: Number(calculateTotal(dayEntries).toFixed(2))
    };
  });

  let comparisonPercentage = 0;
  if (prevTotal > 0) {
    comparisonPercentage = Number((((currentTotal - prevTotal) / prevTotal) * 100).toFixed(2));
  } else if (currentTotal > 0) {
    comparisonPercentage = 100;
  }

  return {
    data: dailyEarnings,
    totalEarnings: Number(currentTotal.toFixed(2)),
    comparisonPercentage
  };
};

export const ReportService = {
  getWeeklyEmployeeEarnings
};
