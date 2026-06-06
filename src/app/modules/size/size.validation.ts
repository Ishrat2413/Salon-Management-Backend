import { z } from 'zod';

const createSize = z.object({
  body: z
    .object({
      name: z.string({ message: 'Size name is required.' }).min(2, 'Size name must be at least 2 characters long.')
    })
    .strict()
});

const updateSize = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Size name must be at least 2 characters long.').optional()
    })
    .strict()
});

export const SizeValidation = {
  createSize,
  updateSize
};
