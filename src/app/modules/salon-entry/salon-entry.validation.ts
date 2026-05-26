import { z } from 'zod';

const createSalonEntry = z.object({
  body: z.object({
    employeeId: z.string().uuid({ message: 'Valid employee ID is required.' }),
    salonId: z.string().uuid({ message: 'Valid salon ID is required.' }),
    serviceId: z.string().uuid({ message: 'Valid service ID is required.' }),
    clientName: z.string().optional(),
    totalPrice: z.number().nonnegative({ message: 'Total price must be a non-negative number.' }),
    actualPrice: z.number().nonnegative().optional(),
    tips: z.number().nonnegative().optional(),
    addHair: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    isSplit: z.boolean().optional(),
    splits: z.array(
      z.object({
        employeeId: z.string().uuid({ message: 'Valid split employee ID is required.' }),
        totalPrice: z.number().nonnegative(),
        tips: z.number().nonnegative().optional()
      })
    ).optional()
  }).strict()
});

const updateSalonEntry = z.object({
  body: z.object({
    employeeId: z.string().uuid({ message: 'Valid employee ID is required.' }).optional(),
    salonId: z.string().uuid({ message: 'Valid salon ID is required.' }).optional(),
    serviceId: z.string().uuid({ message: 'Valid service ID is required.' }).optional(),
    clientName: z.string().optional(),
    totalPrice: z.number().nonnegative({ message: 'Total price must be a non-negative number.' }).optional(),
    actualPrice: z.number().nonnegative().optional(),
    tips: z.number().nonnegative().optional(),
    addHair: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    statusComment: z.string().optional(),
    isSplit: z.boolean().optional(),
    splits: z.array(
      z.object({
        employeeId: z.string().uuid({ message: 'Valid split employee ID is required.' }),
        totalPrice: z.number().nonnegative(),
        tips: z.number().nonnegative().optional()
      })
    ).optional()
  }).strict()
});

const changeStatus = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], { message: 'Status must be APPROVED or REJECTED.' }),
    statusComment: z.string().optional()
  }).strict()
});

export const SalonEntryValidation = {
  createSalonEntry,
  updateSalonEntry,
  changeStatus
};


