import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { getPaginationParams } from '../../common/utils/pagination';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req);
      const filters = req.query;
      const result = await orderService.getOrders(filters, pagination);
      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id as string);
      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const performedBy = user ? `${user.role}: ${user.email}` : 'Unknown Admin';
      const order = await orderService.updateOrderStatus(id as string, { ...req.body, performedBy });
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await orderService.getOrderSummary();
      res.json({
        success: true,
        message: 'Order summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
