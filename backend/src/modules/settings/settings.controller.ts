/**
 * System Settings Controller
 */

import { Request, Response } from 'express';
import SettingsService from './settings.service';
import { asyncHandler } from '@/common/middleware/error.middleware';
import { AuthRequest } from '@/types/global';

class SettingsController {
  /**
   * GET /api/settings
   */
  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const data = await SettingsService.getSettings();
    res.json({ success: true, data });
  });

  /**
   * PUT /api/settings/:section
   */
  updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = (req.user?.id as string) || '';
    const section = (req.params.section as string) || '';
    const ipAddress = (req.ip as any) || '';

    const data = await (SettingsService as any).updateSettings(userId, section, req.body, ipAddress);
    res.json({ success: true, message: `${section} settings updated successfully`, data });
  });

  /**
   * GET /api/settings/logs
   */
  getLogs = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      module: req.query.module as string,
      adminId: req.query.adminId as string,
      date: req.query.date as string,
    };

    const data = await SettingsService.getSettingsLogs(filters);
    res.json({ success: true, data });
  });

  /**
   * POST /api/settings/verify
   */
  verifySensitiveAction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id!;
    const { password } = req.body;

    await SettingsService.verifyAdminPassword(userId, password);
    res.json({ success: true, message: 'Identity verified' });
  });

  /**
   * POST /api/settings/backup
   */
  triggerBackup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id!;
    const result = await SettingsService.triggerBackup(userId);
    res.json(result);
  });

  /**
   * GET /api/settings/snapshots
   */
  getSnapshots = asyncHandler(async (_req: Request, res: Response) => {
    const data = await SettingsService.getSnapshots();
    res.json({ success: true, data });
  });
}

export default new SettingsController();
