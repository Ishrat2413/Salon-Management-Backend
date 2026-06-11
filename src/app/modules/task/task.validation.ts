import { z } from 'zod';

const createTask = z.object({
  body: z.object({
    title: z.string({
      message: 'Title is required'
    }),
    description: z.string({
      message: 'Description is required'
    }),
    assignedToId: z.string({
      message: 'Assigned employee is required'
    })
  })
});

const updateTask = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    assignedToId: z.string().optional(),
    status: z.enum(['PENDING', 'COMPLETION_REQUESTED', 'COMPLETED']).optional()
  })
});

const requestCompletion = z.object({
  body: z.object({
    // No fields required, but we follow the pattern
  }).strict()
});

export const TaskValidation = {
  createTask,
  updateTask,
  requestCompletion
};
