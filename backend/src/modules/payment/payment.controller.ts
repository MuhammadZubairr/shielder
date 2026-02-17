import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { PaginationParams } from '../../common/utils/pagination';

const paymentService = new PaymentService();

export class PaymentController {
  /**
   * Get payment dashboard stats
   */
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await paymentService.getPaymentStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all payments
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status,
        method: req.query.method,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        skip: (parseInt(req.query.page as string || '1') - 1) * (parseInt(req.query.limit as string || '10')),
      };

      const result = await paymentService.getAllPayments(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id as string);
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record manual payment
   */
  async record(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const payment = await paymentService.recordPayment({
        ...req.body,
        recordedBy: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process refund
   */
  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const payment = await paymentService.processRefund(
        id as string,
        userId,
        req.body.notes
      );

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}
