import { z } from 'zod';

const createLength = z.object({
  body: z
    .object({
      name: z.string({ message: 'Length name is required.' }).min(2, 'Length name must be at least 2 characters long.')
    })
    .strict()
});

const updateLength = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Length name must be at least 2 characters long.').optional()
    })
    .strict()
});

export const LengthValidation = {
  createLength,
  updateLength
};
