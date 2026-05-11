import type { UserRole } from '../../interfaces/auth.interface';

export interface IUserRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  salonId?: string;
  role?: 'EMPLOYEE' | 'MANAGER';
}

export interface IUserLoginPayload {
  email: string;
  password: string;
}

export interface IUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  salonId: string | null;
}

export interface ILoginResponse {
  accessToken: string;
  user: IUserResponse;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IVerifyResetCodePayload {
  email: string;
  code: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}
