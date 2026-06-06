import { Prisma, Task, TaskStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { ITaskFilterRequest } from './task.interface';

const taskInclude = {
  assignedTo: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  },
  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  },
  completedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  }
};

const insertIntoDB = async (data: Prisma.TaskCreateInput): Promise<Task> => {
  const result = await prisma.task.create({
    data,
    include: taskInclude
  });
  return result;
};

const getAllFromDB = async (
  filters: ITaskFilterRequest,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  },
  user: { id: string; role: string }
): Promise<{ data: Task[]; meta: { page: number; limit: number; total: number } }> => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.TaskWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ]
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key]
        }
      }))
    });
  }

  // Role based filtering
  if (user.role === 'EMPLOYEE') {
    andConditions.push({
      assignedToId: user.id
    });
  }

  const whereConditions: Prisma.TaskWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.task.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder
    },
    include: taskInclude
  });

  const total = await prisma.task.count({
    where: whereConditions
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
};

const getByIdFromDB = async (id: string, user: { id: string; role: string }): Promise<Task | null> => {
  const result = await prisma.task.findUnique({
    where: {
      id
    },
    include: taskInclude
  });

  if (!result) {
    throw new AppError(404, 'Task not found');
  }

  if (user.role === 'EMPLOYEE' && result.assignedToId !== user.id) {
    throw new AppError(403, 'You do not have permission to view this task');
  }

  return result;
};

const requestCompletion = async (id: string, userId: string): Promise<Task> => {
  const task = await prisma.task.findUnique({
    where: { id }
  });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.assignedToId !== userId) {
    throw new AppError(403, 'You can only request completion for tasks assigned to you');
  }

  if (task.status !== 'PENDING') {
    throw new AppError(400, `Task is already ${task.status}`);
  }

  const result = await prisma.task.update({
    where: { id },
    data: {
      status: 'COMPLETION_REQUESTED',
      completionRequestedAt: new Date()
    },
    include: taskInclude
  });

  return result;
};

const approveCompletion = async (id: string, userId: string): Promise<Task> => {
  const task = await prisma.task.findUnique({
    where: { id }
  });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.status !== 'COMPLETION_REQUESTED') {
    throw new AppError(400, 'Only tasks with COMPLETION_REQUESTED status can be approved');
  }

  const result = await prisma.task.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      completedById: userId
    },
    include: taskInclude
  });

  return result;
};

const markAsCompleted = async (id: string, userId: string): Promise<Task> => {
  const task = await prisma.task.findUnique({
    where: { id }
  });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.status === 'COMPLETED') {
    throw new AppError(400, 'Task is already completed');
  }

  const result = await prisma.task.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      completedById: userId
    },
    include: taskInclude
  });

  return result;
};

const updateInDB = async (id: string, data: Partial<Task>): Promise<Task> => {
  const result = await prisma.task.update({
    where: { id },
    data,
    include: taskInclude
  });
  return result;
};

const deleteFromDB = async (id: string): Promise<Task> => {
  const result = await prisma.task.delete({
    where: { id },
    include: taskInclude
  });
  return result;
};

export const TaskService = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  requestCompletion,
  approveCompletion,
  markAsCompleted,
  updateInDB,
  deleteFromDB
};
