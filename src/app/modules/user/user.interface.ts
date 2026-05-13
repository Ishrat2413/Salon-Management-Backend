import type { UserRole } from '../../interfaces/auth.interface';

export interface IChangeRolePayload {
  role: UserRole;
}

export interface IChangeStatusPayload {
  status: 'PENDING' | 'ACTIVE' | 'SUSPEND' | 'REJECTED';
}

export interface IUserFilterParams {
  searchTerm?: string;
  salonId?: string;
}

