/**
 * Reports Service
 * handles complex data aggregation for various enterprise reports
 */

import { prisma } from '../../config/database';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { AuditService } from '../../common/services/audit.service';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export class ReportsService {
  /**
   * 1. Dashboard Overview Summary
   */
  async getOverviewSummary(dateRange: { from: Date; to: Date }) {
    const { from, to } = dateRange;

    const [salesData, ordersData, refundsData, expensesData, inventoryValue] = await Promise.all([
      // Total Sales (Sum of PAID payments)
      prisma.payment.aggregate({
        where: { 
          status: PaymentStatus.PAID,
          createdAt: { gte: from, lte: to }
        },
        _sum: { amount: true }
      }),
      // Total Orders count
      prisma.order.count({
        where: { createdAt: { gte: from, lte: to } }
      }),
      // Total Refunds
      prisma.payment.aggregate({
        where: { 
          status: PaymentStatus.REFUNDED,
          createdAt: { gte: from, lte: to }
        },
        _sum: { amount: true }
      }),
      // Expenses
      (prisma as any).expense.aggregate({
        where: { date: { gte: from, lte: to } },
        _sum: { amount: true }
      }),
      // Inventory Value (Using stock count for now)
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: { stock: true }
      })
    ]);

    const totalSales = Number(salesData._sum.amount) || 0;
    const totalRefunds = Number(refundsData._sum.amount) || 0;
    const totalExpenses = Number(expensesData._sum.amount) || 0;
    const totalRevenue = totalSales - totalRefunds;
    const netProfit = totalRevenue - totalExpenses;

    const [lowStockRaw, salesTrend] = (await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*)::INT as count FROM products WHERE is_active = true AND stock <= minimum_stock_threshold AND stock > 0`,
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          SUM(CASE WHEN status = 'PAID' THEN amount WHEN status = 'REFUNDED' THEN -amount ELSE 0 END)::FLOAT as amount
        FROM payments
        WHERE status IN ('PAID', 'REFUNDED') AND created_at >= ${from} AND created_at <= ${to}
        GROUP BY 1
        ORDER BY 1 ASC
      `
    ])) as [any[], any[]];

    return {
      summary: {
        totalSales,
        orderCount: ordersData,
        avgOrderValue: ordersData > 0 ? totalSales / ordersData : 0,
        inventoryValue: Number(inventoryValue._sum.stock) || 0,
        totalRevenue,
        totalRefunds,
        totalExpenses,
        netProfit,
        lowStockProducts: lowStockRaw[0]?.count || 0,
      },
      salesTrend: salesTrend.map((t: any) => ({ ...t, amount: Number(t.amount) }))
    };
  }

  /**
   * 2. Sales Report
   */
  async getSalesReport(filters: {
    from: Date;
    to: Date;
    categoryId?: string;
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
  }) {
    const { from, to, categoryId, paymentStatus, orderStatus } = filters;

    // Build common filter conditions for raw queries
    const whereItemsConditions: string[] = [
      `o.created_at >= '${from.toISOString()}'`,
      `o.created_at <= '${to.toISOString()}'`
    ];

    if (categoryId) whereItemsConditions.push(`p."categoryId" = '${categoryId}'`);
    if (paymentStatus) whereItemsConditions.push(`o.payment_status = '${paymentStatus}'`);
    if (orderStatus) whereItemsConditions.push(`o.status = '${orderStatus}'`);

    const whereItemsClause = whereItemsConditions.length > 0 ? `WHERE ${whereItemsConditions.join(' AND ')}` : '';

    // For Sales by Date, if categoryId is present, we need to join with items
    const [salesByDateRaw, salesByCategoryRaw, salesByProductRaw, topProductsRaw] = await Promise.all([
      // Sales by Date (Line Chart)
      prisma.$queryRawUnsafe(`
        SELECT 
          DATE_TRUNC('day', o.created_at) as date,
          COALESCE(${categoryId ? 'SUM(oi.total_price)' : 'SUM(o.total)'}, 0)::FLOAT as amount
        FROM orders o
        ${categoryId ? 'JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id' : ''}
        ${whereItemsClause}
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      // Sales by Category (Pie Chart)
      prisma.$queryRawUnsafe(`
        SELECT 
          ct.name,
          COALESCE(SUM(oi.total_price), 0)::FLOAT as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN category_translations ct ON p."categoryId" = ct."categoryId" AND ct.locale = 'en'
        JOIN orders o ON oi.order_id = o.id
        ${whereItemsClause}
        GROUP BY ct.name
      `),
      // Sales by Product (Table)
      prisma.$queryRawUnsafe(`
        SELECT 
          p.id,
          COALESCE(pt.name, 'Untitled Product') as "name",
          COALESCE(ct.name, 'Uncategorized') as "categoryName",
          COALESCE(SUM(oi.quantity), 0)::INT as "quantitySold",
          COALESCE(SUM(oi.total_price), 0)::FLOAT as "totalRevenue"
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_translations pt ON p.id = pt."productId" AND pt.locale = 'en'
        LEFT JOIN category_translations ct ON p."categoryId" = ct."categoryId" AND ct.locale = 'en'
        JOIN orders o ON oi.order_id = o.id
        ${whereItemsClause}
        GROUP BY p.id, pt.name, ct.name
        ORDER BY "totalRevenue" DESC
      `),
      // Top 10 Best-Selling Products
      prisma.$queryRawUnsafe(`
        SELECT 
          COALESCE(pt.name, 'Untitled Product') as name,
          COALESCE(SUM(oi.quantity), 0)::INT as sales
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_translations pt ON p.id = pt."productId" AND pt.locale = 'en'
        JOIN orders o ON oi.order_id = o.id
        ${whereItemsClause}
        GROUP BY 1
        ORDER BY sales DESC
        LIMIT 10
      `)
    ]);

    const salesByDate = (salesByDateRaw as any[]).map(d => ({ ...d, amount: Number(d.amount) }));
    const salesByCategory = (salesByCategoryRaw as any[]).map(c => ({ ...c, revenue: Number(c.revenue) }));
    const salesByProduct = (salesByProductRaw as any[]).map(p => ({ 
      ...p, 
      quantitySold: Number(p.quantitySold), 
      totalRevenue: Number(p.totalRevenue) 
    }));
    const topSellingProducts = (topProductsRaw as any[]).map(p => ({
      name: p.name,
      sales: Number(p.sales)
    }));

    // Calculate Summary
    const totalRevenue = salesByCategory.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalUnitsSold = salesByProduct.reduce((acc, curr) => acc + curr.quantitySold, 0);
    const productCount = salesByProduct.length;

    return {
      summary: {
        totalRevenue,
        totalUnitsSold,
        productCount,
        averageOrderValue: salesByDate.length > 0 ? totalRevenue / salesByDate.length : 0 
      },
      salesByDate,
      salesByCategory,
      salesByProduct,
      topSellingProducts
    };
  }

  /**
   * Export Sales Report
   */
  async exportSalesReport(data: any, format: 'pdf' | 'excel' | 'csv') {
    if (format === 'excel' || format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(data.salesByProduct);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales By Product');
      
      if (format === 'csv') {
        return XLSX.write(workbook, { bookType: 'csv', type: 'buffer' });
      }
      return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    }

    if (format === 'pdf') {
      return new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();

        doc.fontSize(16).text('Top 10 Selling Products');
        data.topSellingProducts.forEach((p: any, i: number) => {
          doc.fontSize(10).text(`${i + 1}. ${p.name}: ${p.sales} sales`);
        });

        doc.moveDown();
        doc.fontSize(16).text('Sales by Category');
        data.salesByCategory.forEach((c: any) => {
          doc.fontSize(10).text(`${c.name}: $${c.revenue.toFixed(2)}`);
        });

        doc.end();
      });
    }

    throw new Error('Unsupported format');
  }

  /**
   * 3. Order Report
   */
  async getOrderReport(from: Date, to: Date) {
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { id: true }
    });

    const trend: any[] = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(id)::INT as count
      FROM orders
      WHERE created_at >= ${from} AND created_at <= ${to}
      GROUP BY date
      ORDER BY date ASC
    `;

    const recentLargeOrders = await prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      take: 10,
      orderBy: { total: 'desc' },
      include: {
        users: { 
          include: { profile: { select: { fullName: true } } }
        }
      } as any
    });

    return {
      stats: stats.reduce((acc, curr) => ({ ...acc, [curr.status]: (curr._count as any)?.id || 0 }), {}),
      trend: trend.map((t: any) => ({ ...t, count: Number(t.count) })),
      recentLargeOrders: recentLargeOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName || o.users?.profile?.fullName || 'Guest',
        createdAt: o.createdAt,
        totalAmount: Number(o.total)
      }))
    };
  }

  /**
   * 4. Inventory Report
   */
  async getInventoryReport() {
    const [currentStock, lowStock, outOfStock] = await Promise.all([
      // Current Stock (Total items)
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: { stock: true }
      }),
      // Low Stock Products
      prisma.$queryRaw`SELECT COUNT(*)::INT as count FROM products WHERE is_active = true AND stock <= minimum_stock_threshold AND stock > 0`,
      // Out of Stock
      prisma.product.count({
        where: { isActive: true, stock: 0 }
      })
    ]);

    const movement: any[] = await (prisma as any).stock_history.findMany({
      take: 20,
      orderBy: { created_at: 'desc' },
      include: {
        product: {
          select: {
            translations: { where: { locale: 'en' }, take: 1 }
          }
        }
      }
    });

    return {
      currentStockTotal: Number(currentStock._sum.stock) || 0,
      lowStockCount: (lowStock as any)[0]?.count || 0,
      outOfStockCount: outOfStock,
      recentMovement: movement
    };
  }

  /**
   * 5. Payment Report
   */
  async getPaymentReport(from: Date, to: Date) {
    const [stats, trend] = await Promise.all([
      prisma.payment.groupBy({
        by: ['status'],
        where: { createdAt: { gte: from, lte: to } },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          SUM(CASE WHEN status = 'PAID' THEN amount WHEN status = 'REFUNDED' THEN -amount ELSE 0 END)::FLOAT as amount
        FROM payments
        WHERE status IN ('PAID', 'REFUNDED') AND created_at >= ${from} AND created_at <= ${to}
        GROUP BY date
        ORDER BY date ASC
      `
    ]);

    return {
      stats: stats.reduce((acc, curr) => ({ 
        ...acc, 
        [curr.status]: { 
          amount: Number(curr._sum.amount) || 0, 
          count: (curr._count as any)?.id || 0 
        } 
      }), {}),
      revenueTrend: (trend as any[]).map(t => ({ ...t, amount: Number(t.amount) }))
    };
  }

  /**
   * 6. Profit & Loss Report
   */
  async getProfitLossReport(from: Date, to: Date) {
    const [salesData, refundsData, expensesData] = await Promise.all([
      prisma.payment.aggregate({
        where: { 
          status: PaymentStatus.PAID,
          createdAt: { gte: from, lte: to }
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { 
          status: PaymentStatus.REFUNDED,
          createdAt: { gte: from, lte: to }
        },
        _sum: { amount: true }
      }),
      (prisma as any).expense.aggregate({
        where: { date: { gte: from, lte: to } },
        _sum: { amount: true }
      })
    ]);

    const totalSales = Number(salesData._sum.amount) || 0;
    const totalRefunds = Number(refundsData._sum.amount) || 0;
    const totalRevenue = totalSales - totalRefunds;
    const totalExpenses = Number(expensesData._sum.amount) || 0;
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalSales,
      totalRefunds,
      totalRevenue,
      totalExpenses,
      netProfit,
      period: { from, to }
    };
  }

  /**
   * Log Export Actions
   */
  async logExport(userId: string, reportType: string, format: string) {
    await AuditService.log({
      userId,
      action: 'REPORT_EXPORTED',
      entityType: 'REPORT',
      entityId: reportType,
      changes: { format, timestamp: new Date() }
    });
  }
}
