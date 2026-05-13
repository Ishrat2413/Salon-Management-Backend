import { z } from 'zod';

const createService = z.object({
  body: z
    .object({
      name: z.string({ message: 'Service name is required.' }).min(2, 'Service name must be at least 2 characters long.')
    })
    .strict()
});

const updateService = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Service name must be at least 2 characters long.').optional()
    })
    .strict()
});

export const ServiceValidation = {
  createService,
  updateService
};
