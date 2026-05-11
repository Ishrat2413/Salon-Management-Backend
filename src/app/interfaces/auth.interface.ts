export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export interface IAuthUser {
  userId: string;
  email: string;
  role: UserRole;
}
