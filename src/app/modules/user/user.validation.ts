import { z } from 'zod';

const changeRole = z.object({
  body: z
    .object({
      role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN'], {
        message: 'Invalid role. Must be EMPLOYEE, MANAGER, or ADMIN.'
      })
    })
    .strict()
});

const changeStatus = z.object({
  body: z
    .object({
      status: z.enum(['PENDING', 'ACTIVE', 'SUSPEND', 'REJECTED'], {
        message: 'Invalid status. Must be PENDING, ACTIVE, SUSPEND, or REJECTED.'
      }),
      commissionRate: z.number().min(0).max(100).optional()
    })
    .strict()
});

const updateCommissionRate = z.object({
  body: z
    .object({
      commissionRate: z.number().min(0).max(100)
    })
    .strict()
});

export const UserValidation = {
  changeRole,
  changeStatus,
  updateCommissionRate
};
