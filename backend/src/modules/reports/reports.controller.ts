/**
 * Reports Controller
 * Handles HTTP requests for enterprise reports
 */

import { Response } from 'express';
import { ReportsService } from './reports.service';
import { asyncHandler } from '@/common/utils/helpers';
import { AuthRequest } from '@/types/global';

const reportsService = new ReportsService();

class ReportsController {
  /**
   * @swagger
   * /api/reports/overview:
   *   get:
   *     summary: Get dashboard summary cards (Super Admin)
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Overview summary data
   */
  getOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to } = req.query;
    
    // Default to last 30 days if not provided
    const dateTo = to ? new Date(to as string) : new Date();
    const dateFrom = from ? new Date(from as string) : new Date();
    if (!from) dateFrom.setDate(dateTo.getDate() - 30);

    const data = await reportsService.getOverviewSummary({ from: dateFrom, to: dateTo });
    
    res.json({
      success: true,
      data
    });
  });

  /**
   * @swagger
   * /api/reports/sales:
   *   get:
   *     summary: Get detailed sales report (Super Admin)
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: categoryId
   *         schema: { type: string }
   *       - in: query
   *         name: paymentStatus
   *         schema: { type: string }
   *       - in: query
   *         name: orderStatus
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Sales report data
   */
  getSalesReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to, categoryId, paymentStatus, orderStatus } = req.query;
    const dateTo = to ? new Date(to as string) : new Date();
    const dateFrom = from ? new Date(from as string) : new Date();
    if (!from) dateFrom.setDate(dateTo.getDate() - 30);

    const data = await reportsService.getSalesReport({
      from: dateFrom,
      to: dateTo,
      categoryId: categoryId as string,
      paymentStatus: paymentStatus as any,
      orderStatus: orderStatus as any
    });
    
    res.json({
      success: true,
      data
    });
  });

  /**
   * @swagger
   * /api/reports/sales/export:
   *   get:
   *     summary: Export sales report as PDF, Excel or CSV
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: format
   *         schema: { type: string, enum: [pdf, excel, csv], default: excel }
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *     responses:
   *       200:
   *         description: File download
   */
  exportSalesReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to, categoryId, paymentStatus, orderStatus, format = 'excel' } = req.query;
    const dateTo = to ? new Date(to as string) : new Date();
    const dateFrom = from ? new Date(from as string) : new Date();
    if (!from) dateFrom.setDate(dateTo.getDate() - 30);

    const data = await reportsService.getSalesReport({
      from: dateFrom,
      to: dateTo,
      categoryId: categoryId as string,
      paymentStatus: paymentStatus as any,
      orderStatus: orderStatus as any
    });

    const buffer = await reportsService.exportSalesReport(data, format as any);

    const filename = `sales-report-${new Date().getTime()}.${format === 'excel' ? 'xlsx' : format}`;
    const contentType = format === 'pdf' ? 'application/pdf' : 
                        format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
                        'text/csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);

    // Log the export action
    await reportsService.logExport(req.user?.id || 'system', 'SALES_REPORT', format as string);
  });

  /**
   * @swagger
   * /api/reports/orders:
   *   get:
   *     summary: Get detailed order report (Super Admin)
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Order report data
   */
  getOrderReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to } = req.query;
    const dateTo = to ? new Date(to as string) : new Date();
    const dateFrom = from ? new Date(from as string) : new Date();
    if (!from) dateFrom.setDate(dateTo.getDate() - 30);

    const data = await reportsService.getOrderReport(dateFrom, dateTo);
    
    res.json({
      success: true,
      data
    });
  });

  /**
   * @swagger
   * /api/reports/inventory:
   *   get:
   *     summary: Get detailed inventory report (Super Admin)
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Inventory report data
   */
  getInventoryReport = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await reportsService.getInventoryReport();
    
    res.json({
      success: true,
      data
    });
  });

  /**
   * @swagger
   * /api/reports/payments:
   *   get:
   *     summary: Get detailed payment report (Super Admin)
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Payment report data
   */
  getPaymentReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to } = req.query;
    const dateTo = to ? new Date(to as string) : new Date();
    const dateFrom = from ? new Date(from as string) : new Date();
    if (!from) dateFrom.setDate(dateTo.getDate() - 30);

    const data = await reportsService.getPaymentReport(dateFrom, dateTo);
    
    res.json({
      success: true,
      data
    });
  });

  /**
   * @swagger
   * /api/reports/profit-loss:
   *   get:
   *     summary: Get P&L (Profit and Loss) report (Super Admin)
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Profit and loss report
   */
  getProfitLossReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to } = req.query;
    const dateTo = to ? new Date(to as string) : new Date();
    const dateFrom = from ? new Date(from as string) : new Date();
    if (!from) dateFrom.setDate(dateTo.getDate() - 30);

    const data = await reportsService.getProfitLossReport(dateFrom, dateTo);
    
    res.json({
      success: true,
      data
    });
  });

  /**
   * @swagger
   * /api/reports/export/log:
   *   post:
   *     summary: Log a report export action
   *     tags: [Reports]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reportType: { type: string }
   *               format: { type: string, enum: [pdf, excel, csv] }
   *     responses:
   *       200:
   *         description: Export action logged
   */
  logExport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reportType, format } = req.body;
    const userId = req.user?.id || 'system';

    await reportsService.logExport(userId, reportType, format);
    
    res.json({
      success: true,
      message: 'Export action logged'
    });
  });
}

export default new ReportsController();
