import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import type {
  ISalonEntryCreatePayload,
  ISalonEntryFilterParams,
  ISalonEntryUpdatePayload
} from './salon-entry.interface';

const salonEntryInclude = {
  service: { select: { id: true, name: true } },
  salon: { select: { id: true, name: true } },
  employee: {
    select: {
      id: true,
      fullName: true,
      commissionRate: { select: { rate: true } }
    }
  },
  approvedBy: {
    select: {
      id: true,
      fullName: true
    }
  },
  splits: {
    include: {
      employee: {
        select: {
          id: true,
          fullName: true,
          commissionRate: { select: { rate: true } }
        }
      }
    }
  }
} as const;

type CommissionRateRelation = {
  rate: number | null;
};

type UserSummary = {
  id: string;
  fullName: string;
  commissionRate: CommissionRateRelation | null;
};

type SplitEntrySummary = {
  employeeId: string;
  totalPrice: number;
  tips: number | null;
  commissionRate: number | null;
  commissionEarnings: number | null;
  employee: UserSummary;
};

type SalonEntryWithRelations = {
  id: string;
  clientName: string | null;
  serviceId: string;
  service: { id: string; name: string };
  salonId: string;
  salon: { id: string; name: string };
  employeeId: string;
  employee: UserSummary;
  approvedById: string | null;
  approvedBy: { id: string; fullName: string } | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusComment: string | null;
  createdAt: Date;
  totalPrice: number;
  actualPrice: number;
  tips: number | null;
  addHair: number | null;
  notes: string | null;
  commissionRate: number | null;
  commissionEarnings: number | null;
  isSplit: boolean;
  splits: SplitEntrySummary[];
};

type SplitEntryCreatePayload = {
  employeeId: string;
  totalPrice: number;
  tips: number;
  commissionRate: number;
  commissionEarnings: number;
};

type SalonEntryMetaRow = Pick<
  SalonEntryWithRelations,
  'employeeId' | 'totalPrice' | 'tips' | 'commissionEarnings' | 'isSplit'
> & {
  splits: Array<
    Pick<SplitEntrySummary, 'employeeId' | 'totalPrice' | 'tips' | 'commissionEarnings'>
  >;
};

const formatSalonEntry = (entry: SalonEntryWithRelations, userId: string) => {
  let loggedInUserTips = 0;
  let loggedInUserTotalPrice = 0;
  let loggedInUserCommissionRate = 0;
  let commissionEarnings = 0;

  // Use snapshot fields if available, otherwise fallback to dynamic calculation (legacy)
  if (entry.employeeId === userId) {
    loggedInUserTips = entry.tips || 0;
    loggedInUserTotalPrice = entry.totalPrice;

    // Fallback logic
    if (entry.isSplit && entry.splits && entry.splits.length > 0) {
      const splitTipsSum = entry.splits.reduce(
        (sum: number, split: SplitEntrySummary) => sum + (split.tips || 0),
        0
      );
      const splitPriceSum = entry.splits.reduce(
        (sum: number, split: SplitEntrySummary) => sum + split.totalPrice,
        0
      );
      loggedInUserTips -= splitTipsSum;
      loggedInUserTotalPrice -= splitPriceSum;
    }

    loggedInUserCommissionRate = entry.commissionRate || entry.employee.commissionRate?.rate || 0;
    commissionEarnings =
      entry.commissionEarnings ??
      (loggedInUserCommissionRate > 0
        ? (loggedInUserTotalPrice * loggedInUserCommissionRate) / 100
        : 0);
  } else if (entry.isSplit && entry.splits) {
    const userSplit = entry.splits.find((s: SplitEntrySummary) => s.employeeId === userId);
    if (userSplit) {
      loggedInUserTips = userSplit.tips || 0;
      loggedInUserTotalPrice = userSplit.totalPrice;
      loggedInUserCommissionRate =
        userSplit.commissionRate || userSplit.employee.commissionRate?.rate || 0;
      commissionEarnings =
        userSplit.commissionEarnings ??
        (loggedInUserCommissionRate > 0
          ? (loggedInUserTotalPrice * loggedInUserCommissionRate) / 100
          : 0);
    }
  }

  return {
    id: entry.id,
    clientName: entry.clientName,
    serviceId: entry.serviceId,
    serviceName: entry.service.name,
    salonId: entry.salonId,
    salonName: entry.salon.name,
    employeeId: entry.employeeId,
    employeeName: entry.employee.fullName,
    status: entry.status,
    statusComment: entry.statusComment,
    approvedById: entry.approvedById,
    approvedByName: entry.approvedBy?.fullName || null,
    createdAt: entry.createdAt,
    totalPrice: entry.totalPrice,
    actualPrice: entry.actualPrice || 0,
    tips: entry.tips || 0,
    addHair: entry.addHair || 0,
    notes: entry.notes || null,
    loggedInUserTotalPrice,
    loggedInUserTips,
    loggedInUserCommissionRate,
    commissionEarnings,
    isSplit: entry.isSplit,
    splits: entry.splits
      ? entry.splits.map((s: SplitEntrySummary) => ({
          employeeId: s.employeeId,
          employeeName: s.employee.fullName,
          totalPrice: s.totalPrice,
          tips: s.tips || 0,
          commissionRate: s.commissionRate || s.employee.commissionRate?.rate || 0,
          commissionEarnings:
            s.commissionEarnings ||
            ((s.commissionRate || s.employee.commissionRate?.rate || 0) * s.totalPrice) / 100
        }))
      : []
  };
};

const createSalonEntry = async (payload: ISalonEntryCreatePayload) => {
  const { splits, ...entryData } = payload;

  const mainEmployee = await prisma.user.findUnique({
    where: { id: payload.employeeId },
    include: { commissionRate: true }
  });

  const mainRate = mainEmployee?.commissionRate?.rate || 0;
  const hair = entryData.addHair || 0;
  const actualPrice = entryData.actualPrice ?? entryData.totalPrice - hair;

  // Calculate main employee's share if splitting
  let mainEmployeePrice = actualPrice;
  if (entryData.isSplit && splits && splits.length > 0) {
    const splitPriceSum = splits.reduce((sum, split) => sum + split.totalPrice, 0);
    mainEmployeePrice -= splitPriceSum;
  }
  const mainEarnings = (mainEmployeePrice * mainRate) / 100;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // We need to fetch rates for split employees too
    const splitData: SplitEntryCreatePayload[] = [];
    if (entryData.isSplit && splits && splits.length > 0) {
      for (const split of splits) {
        const emp = await tx.user.findUnique({
          where: { id: split.employeeId },
          include: { commissionRate: true }
        });
        const rate = emp?.commissionRate?.rate || 0;
        splitData.push({
          employeeId: split.employeeId,
          totalPrice: split.totalPrice,
          tips: split.tips || 0,
          commissionRate: rate,
          commissionEarnings: (split.totalPrice * rate) / 100
        });
      }
    }

    const salonEntry = await tx.salonEntry.create({
      data: {
        ...entryData,
        actualPrice,
        commissionRate: mainRate,
        commissionEarnings: mainEarnings,
        splits: splitData.length > 0 ? { create: splitData } : undefined
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

  // Standardize role to uppercase to avoid casing issues
  const upperRole = role.toUpperCase();

  // 1. RBAC Conditions
  if (upperRole === 'EMPLOYEE') {
    andConditions.push({
      OR: [{ employeeId: userId }, { splits: { some: { employeeId: userId } } }]
    });
  }

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

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  const whereConditions: Prisma.SalonEntryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 3. Fetch Paginated Data
  const result = (await prisma.salonEntry.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: salonEntryInclude
  })) as SalonEntryWithRelations[];

  const total = await prisma.salonEntry.count({
    where: whereConditions
  });

  // Calculate metadata
  const allMatchingEntries = (await prisma.salonEntry.findMany({
    where: whereConditions,
    include: {
      splits: true
    }
  })) as SalonEntryMetaRow[];

  let totalPrices = 0;
  let totalTips = 0;
  let totalCommissionEarnings = 0;
  let loggedInUserPrices = 0;
  let loggedInUserTipsMeta = 0;
  let loggedInUserCommissionEarnings = 0;

  allMatchingEntries.forEach((entry: SalonEntryMetaRow) => {
    totalPrices += entry.totalPrice;
    totalTips += entry.tips || 0;

    // Use stored earnings or fallback
    let entryTotalCommission = entry.commissionEarnings || 0;
    if (entry.isSplit && entry.splits) {
      entry.splits.forEach((s: SalonEntryMetaRow['splits'][number]) => {
        entryTotalCommission += s.commissionEarnings || 0;
      });
    }
    totalCommissionEarnings += entryTotalCommission;

    let rowLoggedInUserTips = 0;
    let rowLoggedInUserTotalPrice = 0;
    let rowLoggedInUserCommEarnings = 0;

    if (entry.employeeId === userId) {
      rowLoggedInUserTips = entry.tips || 0;
      rowLoggedInUserTotalPrice = entry.totalPrice;
      rowLoggedInUserCommEarnings = entry.commissionEarnings || 0;

      if (entry.isSplit && entry.splits && entry.splits.length > 0) {
        const splitTipsSum = entry.splits.reduce(
          (sum: number, split: SalonEntryMetaRow['splits'][number]) => sum + (split.tips || 0),
          0
        );
        const splitPriceSum = entry.splits.reduce(
          (sum: number, split: SalonEntryMetaRow['splits'][number]) => sum + split.totalPrice,
          0
        );
        rowLoggedInUserTips -= splitTipsSum;
        rowLoggedInUserTotalPrice -= splitPriceSum;
      }
    } else if (entry.isSplit && entry.splits) {
      const userSplit = entry.splits.find(
        (s: SalonEntryMetaRow['splits'][number]) => s.employeeId === userId
      );
      if (userSplit) {
        rowLoggedInUserTips = userSplit.tips || 0;
        rowLoggedInUserTotalPrice = userSplit.totalPrice;
        rowLoggedInUserCommEarnings = userSplit.commissionEarnings || 0;
      }
    }

    loggedInUserPrices += rowLoggedInUserTotalPrice;
    loggedInUserTipsMeta += rowLoggedInUserTips;
    loggedInUserCommissionEarnings += rowLoggedInUserCommEarnings;
  });

  const formattedData = result.map((entry: SalonEntryWithRelations) =>
    formatSalonEntry(entry, userId)
  );

  return {
    meta: {
      page,
      limit,
      total,
      totalPrices,
      totalTips,
      totalCommissionEarnings,
      loggedInUserPrices,
      loggedInUserTips: loggedInUserTipsMeta,
      loggedInUserCommissionEarnings
    },
    data: formattedData
  };
};

const changeStatus = async (
  id: string,
  payload: { status: 'APPROVED' | 'REJECTED'; statusComment?: string },
  approvedById: string
) => {
  const entry = await prisma.salonEntry.findUnique({ where: { id } });

  if (!entry) {
    throw new AppError(404, 'Salon entry not found.');
  }

  const updatedEntry = await prisma.salonEntry.update({
    where: { id },
    data: {
      status: payload.status,
      statusComment: payload.statusComment,
      approvedById: payload.status === 'APPROVED' ? approvedById : null
    },
    include: salonEntryInclude
  });

  return formatSalonEntry(updatedEntry as SalonEntryWithRelations, entry.employeeId);
};

const getSingleSalonEntry = async (id: string, userId: string, role: string) => {
  const entry = await prisma.salonEntry.findUnique({
    where: { id },
    include: salonEntryInclude
  });

  if (!entry) {
    throw new AppError(404, 'Salon entry not found.');
  }

  const upperRole = role.toUpperCase();
  if (upperRole === 'EMPLOYEE') {
    const canAccess =
      entry.employeeId === userId ||
      entry.splits?.some((split: any) => split.employeeId === userId);
    if (!canAccess) {
      throw new AppError(403, 'You do not have permission to view this salon entry.');
    }
  }

  return formatSalonEntry(entry as SalonEntryWithRelations, userId);
};

const updateSalonEntry = async (
  id: string,
  payload: ISalonEntryUpdatePayload,
  userRole: string,
  userId: string
) => {
  const existingEntry = await prisma.salonEntry.findUnique({
    where: { id },
    include: { splits: true }
  });

  if (!existingEntry) {
    throw new AppError(404, 'Salon entry not found.');
  }

  const { splits, ...updateData } = payload;

  // Recalculate actualPrice if totalPrice or addHair is updated
  let actualPrice = updateData.actualPrice;
  if (
    actualPrice === undefined &&
    (updateData.totalPrice !== undefined || updateData.addHair !== undefined)
  ) {
    const newTotal = updateData.totalPrice ?? existingEntry.totalPrice;
    const newHair = updateData.addHair ?? existingEntry.addHair ?? 0;
    actualPrice = newTotal - newHair;
  } else if (actualPrice === undefined) {
    actualPrice =
      (existingEntry as any).actualPrice || existingEntry.totalPrice - (existingEntry.addHair || 0);
  }

  // Handle commission recalculation upon update
  const empId = updateData.employeeId ?? existingEntry.employeeId;
  const mainEmployee = await prisma.user.findUnique({
    where: { id: empId },
    include: { commissionRate: true }
  });
  const mainRate = mainEmployee?.commissionRate?.rate || 0;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let splitData: SplitEntryCreatePayload[] | undefined = undefined;
    if (splits !== undefined) {
      await tx.splitEntry.deleteMany({
        where: { salonEntryId: id }
      });

      if (splits && splits.length > 0) {
        splitData = [];
        for (const split of splits) {
          const emp = await tx.user.findUnique({
            where: { id: split.employeeId },
            include: { commissionRate: true }
          });
          const rate = emp?.commissionRate?.rate || 0;
          splitData.push({
            employeeId: split.employeeId,
            totalPrice: split.totalPrice,
            tips: split.tips || 0,
            commissionRate: rate,
            commissionEarnings: (split.totalPrice * rate) / 100
          });
        }
      }
    }

    // Calculate main employee share
    const finalSplits: Array<{ totalPrice: number }> =
      splits !== undefined ? splits || [] : existingEntry.splits;
    const splitPriceSum = finalSplits.reduce(
      (sum: number, split: { totalPrice: number }) => sum + split.totalPrice,
      0
    );
    const mainEmployeePrice = (actualPrice ?? 0) - splitPriceSum;
    const mainEarnings = (mainEmployeePrice * mainRate) / 100;

    const salonEntry = await tx.salonEntry.update({
      where: { id },
      data: {
        ...updateData,
        actualPrice,
        commissionRate: mainRate,
        commissionEarnings: mainEarnings,
        splits: splitData ? { create: splitData } : undefined
      },
      include: salonEntryInclude
    });

    return salonEntry;
  });

  return formatSalonEntry(result as SalonEntryWithRelations, userId);
};

const deleteSalonEntry = async (id: string) => {
  const entry = await prisma.salonEntry.findUnique({
    where: { id }
  });

  if (!entry) {
    throw new AppError(404, 'Salon entry not found.');
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.splitEntry.deleteMany({
      where: { salonEntryId: id }
    });

    return tx.salonEntry.delete({
      where: { id }
    });
  });

  return result;
};

export const SalonEntryService = {
  createSalonEntry,
  getAllSalonEntries,
  getSingleSalonEntry,
  changeStatus,
  updateSalonEntry,
  deleteSalonEntry
};
