import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TaskService } from './task.service';
import AppError from '../../errors/AppError';

const createTask: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const result = await TaskService.insertIntoDB({
    ...req.body,
    createdById: req.user.userId
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Task created successfully.',
    data: result
  });
});

const getAllTasks: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const filters = {
    searchTerm: req.query.searchTerm as string,
    status: req.query.status as any,
    assignedToId: req.query.assignedToId as string,
    createdById: req.query.createdById as string
  };

  const options = {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string
  };

  const result = await TaskService.getAllFromDB(
    filters,
    options,
    { id: req.user.userId, role: req.user.role }
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tasks retrieved successfully.',
    meta: result.meta,
    data: result.data
  });
});

const getSingleTask: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const result = await TaskService.getByIdFromDB(
    req.params.id as string,
    { id: req.user.userId, role: req.user.role }
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task retrieved successfully.',
    data: result
  });
});

const requestCompletion: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const result = await TaskService.requestCompletion(req.params.id as string, req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Completion requested successfully.',
    data: result
  });
});

const approveCompletion: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const result = await TaskService.approveCompletion(req.params.id as string, req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task completion approved successfully.',
    data: result
  });
});

const markAsCompleted: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }

  const result = await TaskService.markAsCompleted(req.params.id as string, req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task marked as completed successfully.',
    data: result
  });
});

const updateTask: RequestHandler = catchAsync(async (req, res) => {
  const result = await TaskService.updateInDB(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task updated successfully.',
    data: result
  });
});

const deleteTask: RequestHandler = catchAsync(async (req, res) => {
  const result = await TaskService.deleteFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Task deleted successfully.',
    data: result
  });
});

export const TaskController = {
  createTask,
  getAllTasks,
  getSingleTask,
  requestCompletion,
  approveCompletion,
  markAsCompleted,
  updateTask,
  deleteTask
};
