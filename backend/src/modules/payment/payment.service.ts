import { prisma } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../common/errors/api.error';
import { PaymentStatus, PaymentMethod, OrderStatus, NotificationType, UserRole } from '@prisma/client';
import { AuditService } from '../../common/services/audit.service';
import { createPaginatedResponse, PaginationParams } from '../../common/utils/pagination';
import NotificationService from '../notification/notification.service';

export class PaymentService {
  /**
   * Get Payment dashboard stats
   */
  async getPaymentStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRevenue, todayRevenue, pendingPayments, failedPayments] = await Promise.all([
      // Total Revenue: Sum of all PAID payments minus REFUNDED amounts
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true }
      }),
      // Today's Revenue
      prisma.payment.aggregate({
        where: { 
          status: PaymentStatus.PAID,
          createdAt: { gte: today }
        },
        _sum: { amount: true }
      }),
      // Pending Payments count
      prisma.payment.count({
        where: { status: PaymentStatus.PENDING }
      }),
      // Failed Payments count
      prisma.payment.count({
        where: { status: PaymentStatus.FAILED }
      })
    ]);

    // Note: In a real system, we'd also subtract refunded amounts from total revenue.
    // For now, these aggregates give a good starting point.
    const refunds = await prisma.payment.aggregate({
      where: { status: PaymentStatus.REFUNDED },
      _sum: { amount: true }
    });

    const netTotalRevenue = (Number(totalRevenue._sum.amount) || 0) - (Number(refunds._sum.amount) || 0);
    const netTodayRevenue = Number(todayRevenue._sum.amount) || 0;

    return {
      totalRevenue: netTotalRevenue,
      todayRevenue: netTodayRevenue,
      pendingPayments,
      failedPayments
    };
  }

  /**
   * Get all payments with filters and pagination
   */
  async getAllPayments(filters: any, pagination: PaginationParams) {
    const { search, status, method, dateFrom, dateTo } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { order: { customerName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) where.status = status;
    if (method) where.method = method;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const total = await prisma.payment.count({ where });

    const payments = await prisma.payment.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            total: true
          }
        },
        recorder: {
          select: {
            profile: {
              select: { fullName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return createPaginatedResponse(payments, total, pagination.page, pagination.limit);
  }

  /**
   * Get payment details by ID
   */
  async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: {
                  include: {
                    translations: { where: { locale: 'en' } }
                  }
                }
              }
            }
          }
        },
        recorder: {
          select: {
            email: true,
            profile: { select: { fullName: true } }
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    return payment;
  }

  /**
   * Record a manual payment
   */
  async recordPayment(data: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    transactionId?: string;
    notes?: string;
    recordedBy: string;
  }) {
    // 1. Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { payments: true }
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // 2. Prevent overpayment
    const alreadyPaid = order.payments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const remainingBalance = Number(order.total) - alreadyPaid;

    if (data.amount > remainingBalance + 0.01) { // 0.01 for floating point safety
      throw new BadRequestError(`Payment amount ($${data.amount}) exceeds remaining balance ($${remainingBalance.toFixed(2)})`);
    }

    // 3. Double Payment Prevention (Transaction ID check)
    if (data.transactionId) {
      const existing = await prisma.payment.findUnique({
        where: { transactionId: data.transactionId }
      });
      if (existing) {
        throw new BadRequestError('Transaction ID already exists');
      }
    }

    return await prisma.$transaction(async (tx) => {
      // 4. Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: data.orderId,
          amount: data.amount,
          method: data.method,
          status: PaymentStatus.PAID, // Manual records are usually marked paid immediately
          transactionId: data.transactionId,
          notes: data.notes,
          recordedBy: data.recordedBy
        }
      });

      // 5. Update Order Status
      const newTotalPaid = alreadyPaid + data.amount;
      let newPaymentStatus: PaymentStatus = order.paymentStatus;
      let newOrderStatus: OrderStatus = order.status;

      if (newTotalPaid >= Number(order.total) - 0.01) {
        newPaymentStatus = PaymentStatus.PAID;
        // If order was pending, move to confirmed or processing
        if (order.status === OrderStatus.PENDING) {
          newOrderStatus = OrderStatus.PROCESSING;
        }
      } else if (newTotalPaid > 0) {
        newPaymentStatus = PaymentStatus.PARTIALLY_PAID;
      }

      await tx.order.update({
        where: { id: data.orderId },
        data: {
          paymentStatus: newPaymentStatus,
          status: newOrderStatus
        }
      });

      // 6. Audit Log
      await AuditService.log({
        userId: data.recordedBy,
        action: 'PAYMENT_RECORDED',
        entityType: 'PAYMENT',
        entityId: payment.id,
        changes: { amount: data.amount, method: data.method, orderId: data.orderId }
      });

      // 7. Trigger Notifications
      await NotificationService.notify({
        type: NotificationType.PAYMENT_SUCCESSFUL,
        title: 'Payment Received',
        message: `Payment of SAR ${data.amount} received for order ${order.orderNumber}.`,
        module: 'PAYMENT',
        roleTarget: UserRole.SUPER_ADMIN,
        relatedId: payment.id,
        triggeredById: data.recordedBy
      });

      await NotificationService.notify({
        type: NotificationType.PAYMENT_SUCCESSFUL,
        title: 'Payment Confirmed',
        message: `Your payment of SAR ${data.amount} for order ${order.orderNumber} has been received.`,
        module: 'PAYMENT',
        userId: order.userId,
        relatedId: payment.id,
        triggeredById: data.recordedBy
      });

      return payment;
    });
  }

  /**
   * Process a refund
   */
  async processRefund(paymentId: string, userId: string, notes?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestError('Payment is already refunded');
    }

    return await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          notes: notes ? `${payment.notes || ''}\nRefund Note: ${notes}` : payment.notes
        }
      });

      // Update Order Status to REFUNDED if this was the main payment
      // For simplicity, if any payment is refunded, we might mark order as refunded 
      // or check if total paid is now 0.
      const allPayments = await tx.payment.findMany({
        where: { orderId: payment.orderId }
      });

      const totalPaidAfterRefund = allPayments
        .filter(p => p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      let newPaymentStatus: PaymentStatus = PaymentStatus.REFUNDED;
      if (totalPaidAfterRefund > 0) {
        newPaymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
      }

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: newPaymentStatus,
          status: OrderStatus.REFUNDED
        }
      });

      // Audit Log
      await AuditService.log({
        userId,
        action: 'PAYMENT_REFUNDED',
        entityType: 'PAYMENT',
        entityId: payment.id,
        changes: { prevStatus: payment.status, newStatus: PaymentStatus.REFUNDED }
      });

      // Trigger Notification
      await NotificationService.notify({
        type: NotificationType.REFUND_ISSUED,
        title: 'Refund Processed',
        message: `A refund of SAR ${payment.amount} for order ${payment.order.orderNumber} has been processed.`,
        module: 'PAYMENT',
        userId: payment.order.userId,
        relatedId: payment.id,
        triggeredById: userId
      });

      return updatedPayment;
    });
  }
}
