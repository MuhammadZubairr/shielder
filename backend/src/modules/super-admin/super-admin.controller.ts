/**
 * Super Admin Controller
 */

import { Request, Response, NextFunction } from 'express';
import { superAdminService } from './super-admin.service';
import { getPaginationParams } from '../../common/utils/pagination';

export class SuperAdminController {
  /**
   * Get User Management Stats (Total/Active/Inactive/New)
   */
  async getUserStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await superAdminService.getUserStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with full filters and pagination
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req);
      const filters = {
        search: req.query.search,
        role: req.query.role,
        status: req.query.status,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      const result = await superAdminService.getAllUsers(filters, pagination);
      res.json({ success: true, message: 'Users retrieved', ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Legacy Support: Get admins only
   */
  async getAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req);
      const filters = { role: 'ADMIN' };
      const result = await superAdminService.getAllUsers(filters, pagination);
      res.json({ success: true, message: 'Admins retrieved', ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Legacy Support: Get Admin Summary
   */
  async getAdminsSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await superAdminService.getAdminSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new User (Admin, Staff, or Customer)
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = req.user?.id!;
      const user = await superAdminService.createUser(req.body, createdBy);

      res.status(201).json({ 
        success: true, 
        message: 'User account created successfully.', 
        data: user 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update User details, role, or status
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedBy = req.user?.id!;
      const user = await superAdminService.updateUser(
        String(req.params.id),
        req.body,
        updatedBy
      );

      res.json({ 
        success: true, 
        message: 'User account updated successfully.', 
        data: user 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete User (Soft Delete)
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedBy = req.user?.id!;
      const result = await superAdminService.deleteUser(
        String(req.params.id),
        deletedBy
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overall Dashboard Statistics
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await superAdminService.getStatistics();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Dashboard Summary (Counts & Revenue)
   */
  async getDashboardSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await superAdminService.getDashboardSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Analytics data for charts
   */
  async getMonthlyAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await superAdminService.getMonthlyAnalytics();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent system-wide actions/audit logs
   */
  async getRecentActivity(_req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await superAdminService.getRecentActivity();
      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }
}

export const superAdminController = new SuperAdminController();

