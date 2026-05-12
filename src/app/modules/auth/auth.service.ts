import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/email';
import prisma from '../../utils/prisma';
import type {
  IChangePasswordPayload,
  IForgotPasswordPayload,
  ILoginResponse,
  IResetPasswordPayload,
  IUserLoginPayload,
  IUserRegisterPayload,
  IUserResponse,
  IVerifyResetCodePayload
} from './auth.interface';

type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  status: string;
  salonId: string | null;
};

const sanitizeUser = (user: UserRecord): IUserResponse => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  salonId: user.salonId
});

const register = async (payload: IUserRegisterPayload): Promise<IUserResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email
    }
  });

  if (existingUser) {
    throw new AppError(409, 'A user with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      password: hashedPassword,
      salonId: payload.salonId,
      role: payload.role ?? 'EMPLOYEE'
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      salonId: true
    }
  });

  return sanitizeUser(user);
};

const login = async (payload: IUserLoginPayload): Promise<ILoginResponse> => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email
    }
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  if (user.status !== 'ACTIVE') {
    if (user.status === 'PENDING') {
      throw new AppError(403, 'Your account is pending approval.');
    } else if (user.status === 'REJECTED') {
      throw new AppError(403, 'Your account has been rejected.');
    } else if (user.status === 'SUSPEND') {
      throw new AppError(403, 'Your account is suspended.');
    } else {
      throw new AppError(403, 'Your account is not active.');
    }
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const authPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(authPayload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn
  });

  return {
    accessToken,
    user: sanitizeUser(user)
  };
};

const changePassword = async (
  userId: string,
  payload: IChangePasswordPayload
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const isPasswordMatched = await bcrypt.compare(payload.oldPassword, user.password);

  if (!isPasswordMatched) {
    throw new AppError(403, 'Old password does not match.');
  }

  const newHashedPassword = await bcrypt.hash(payload.newPassword, config.bcryptSaltRounds);

  await prisma.user.update({
    where: { id: userId },
    data: { password: newHashedPassword }
  });
};

const forgotPassword = async (payload: IForgotPasswordPayload): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (!user) {
    // We don't throw an error here to prevent email enumeration.
    return;
  }

  // Generate a random 6-digit code
  const resetCode = crypto.randomInt(100000, 999999).toString();
  
  // Set expiration to 15 minutes from now
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Hash the code before saving it to the database for security
  const hashedResetCode = await bcrypt.hash(resetCode, config.bcryptSaltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCode: hashedResetCode,
      passwordResetExpires: expiresAt
    }
  });

  // Send the email with the unhashed 6-digit code
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <div style="background-color: #1a1a1a; padding: 30px 20px; text-align: center; border-bottom: 3px solid #d4af37;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">STYLE CITY</h1>
        <p style="color: #d4af37; margin: 5px 0 0 0; font-size: 14px; letter-spacing: 1px;">PREMIUM SALON SERVICES</p>
      </div>
      
      <div style="padding: 40px 30px; text-align: center;">
        <h2 style="color: #333333; margin-top: 0; margin-bottom: 20px; font-size: 22px; font-weight: 600;">Password Reset Request</h2>
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          We received a request to reset the password for your Style City account. Please use the verification code below to complete the process.
        </p>
        
        <div style="background: linear-gradient(145deg, #fdfbf7 0%, #f4f0e6 100%); border: 1px solid #e8e2d2; padding: 25px; border-radius: 10px; margin-bottom: 30px; display: inline-block;">
          <p style="color: #8c7322; font-size: 13px; text-transform: uppercase; font-weight: bold; margin: 0 0 10px 0; letter-spacing: 1px;">Your Verification Code</p>
          <span style="display: block; font-size: 38px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; margin-left: 8px;">${resetCode}</span>
        </div>
        
        <p style="color: #888888; font-size: 14px; margin-bottom: 10px;">
          <strong style="color: #e74c3c;">Note:</strong> This code will expire in exactly 15 minutes.
        </p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
          If you did not request a password reset, please safely ignore this email or contact our support team if you have concerns.
          <br><br>
          &copy; ${new Date().getFullYear()} Style City. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await sendEmail(user.email, 'Style City - Password Reset Code', emailHtml);
};

const verifyResetCode = async (
  payload: IVerifyResetCodePayload
): Promise<{ resetToken: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (
    !user ||
    !user.passwordResetCode ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < new Date()
  ) {
    throw new AppError(400, 'Invalid or expired reset code.');
  }

  const isCodeValid = await bcrypt.compare(payload.code, user.passwordResetCode);

  if (!isCodeValid) {
    throw new AppError(400, 'Invalid or expired reset code.');
  }

  // Code is valid. Issue a short-lived token to be used on the reset password screen.
  // We use the current password hash as part of the secret so the token becomes invalid
  // immediately after the password is changed.
  const secret = config.jwt.resetSecret + user.password;
  
  const resetToken = jwt.sign(
    { userId: user.id, email: user.email },
    secret,
    { expiresIn: config.jwt.resetExpiresIn }
  );

  return { resetToken };
};

const resetPassword = async (payload: IResetPasswordPayload): Promise<void> => {
  // Decode without verifying first to get the email/userId
  const decoded = jwt.decode(payload.token) as { userId?: string; email?: string } | null;

  if (!decoded || !decoded.userId) {
    throw new AppError(400, 'Invalid reset token.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    throw new AppError(400, 'Invalid reset token.');
  }

  const secret = config.jwt.resetSecret + user.password;

  try {
    jwt.verify(payload.token, secret);
  } catch (error) {
    throw new AppError(400, 'Invalid or expired reset token.');
  }

  // Token is valid. Hash the new password and clear the reset fields.
  const hashedPassword = await bcrypt.hash(payload.newPassword, config.bcryptSaltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetExpires: null
    }
  });
};

export const AuthService = {
  register,
  login,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
};
