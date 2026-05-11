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

export const UserValidation = {
  changeRole
};
