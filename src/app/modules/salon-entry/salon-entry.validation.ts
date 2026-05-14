import { z } from 'zod';

const createSalonEntry = z.object({
  body: z.object({
    employeeId: z.string().uuid({ message: 'Valid employee ID is required.' }),
    salonId: z.string().uuid({ message: 'Valid salon ID is required.' }),
    serviceId: z.string().uuid({ message: 'Valid service ID is required.' }),
    clientName: z.string().optional(),
    totalPrice: z.number().int().nonnegative({ message: 'Total price must be a non-negative integer.' }),
    tips: z.number().int().nonnegative().optional(),
    addHair: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
    isSplit: z.boolean().optional(),
    splits: z.array(
      z.object({
        employeeId: z.string().uuid({ message: 'Valid split employee ID is required.' }),
        totalPrice: z.number().int().nonnegative(),
        tips: z.number().int().nonnegative().optional()
      })
    ).optional()
  }).strict()
});

export const SalonEntryValidation = {
  createSalonEntry
};
