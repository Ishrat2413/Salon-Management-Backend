import { TaskStatus } from '@prisma/client';

export type ITaskFilterRequest = {
  searchTerm?: string | undefined;
  status?: TaskStatus | undefined;
  assignedToId?: string | undefined;
  createdById?: string | undefined;
};
