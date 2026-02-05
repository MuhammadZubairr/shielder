/**
 * Enhanced Authentication Controller
 * Production-ready HTTP handlers for all auth endpoints
 */

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '@/common/utils/helpers';
import type { AuthRequest } from '@/types/global';
import type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  DeviceInfo,
} from './auth.types';

/**
 * Auth Controller Class
 */
class AuthController {
  /**
   * POST /api/auth/signup
   * Register a new user
   */
  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: RegisterRequest = {
      ...req.body,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const result = await AuthService.register(data);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: result,
    });
  });

  /**
   * POST /api/auth/login
   * User login
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: LoginRequest = req.body;
    const deviceInfo: DeviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const result = await AuthService.login(data, deviceInfo);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    const deviceInfo: DeviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const tokens = await AuthService.refreshTokens(refreshToken, deviceInfo);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens,
    });
  });

  /**
   * POST /api/auth/logout
   * Logout from current device
   */
  logout = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const userId = req.user!.userId;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    await AuthService.logout(userId, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  /**
   * POST /api/auth/logout-all
   * Logout from all devices
   */
  logoutAll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    await AuthService.logoutAll(userId);

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  });

  /**
   * POST /api/auth/forgot-password
   * Request password reset
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: ForgotPasswordRequest = req.body;

    await AuthService.forgotPassword(data);

    // Always return success (don't reveal if email exists)
    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  });

  /**
   * POST /api/auth/reset-password
   * Reset password using token
   */
  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: ResetPasswordRequest = req.body;

    await AuthService.resetPassword(data);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  });

  /**
   * PATCH /api/auth/change-password
   * Change password (authenticated)
   */
  changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const data: ChangePasswordRequest = req.body;

    await AuthService.changePassword(userId, data);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again on all devices.',
    });
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const user = await AuthService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  });

  /**
   * GET /api/auth/verify-email/:token
   * Verify email address
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;

    await AuthService.verifyEmail(token as string);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  });

  /**
   * GET /api/auth/sessions
   * Get all active sessions for current user
   */
  getSessions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const sessions = await AuthService.getUserSessions(userId);

    res.status(200).json({
      success: true,
      data: { sessions },
    });
  });

  /**
   * DELETE /api/auth/sessions/:sessionId
   * Revoke a specific session
   */
  revokeSession = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { sessionId } = req.params;

    await AuthService.revokeSession(userId, sessionId as string);

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
    });
  });
}

export default new AuthController();
