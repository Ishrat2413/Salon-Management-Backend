import { z } from 'zod';

const createSalon = z.object({
  body: z
    .object({
      name: z.string({ message: 'Salon name is required.' }).min(2, 'Salon name must be at least 2 characters long.'),
      address: z.string({ message: 'Salon address is required.' }).min(5, 'Salon address must be at least 5 characters long.')
    })
    .strict()
});

const updateSalon = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Salon name must be at least 2 characters long.').optional(),
      address: z.string().min(5, 'Salon address must be at least 5 characters long.').optional()
    })
    .strict()
});

export const SalonValidation = {
  createSalon,
  updateSalon
};
