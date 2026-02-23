/**
 * Quotation Controller
 */

import { Request, Response } from 'express';
import { quotationService } from './quotation.service';
import { asyncHandler } from '@/common/middleware/error.middleware';

export class QuotationController {

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, search, status, dateFrom, dateTo, sortBy, sortOrder } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const result = await quotationService.getQuotations(
            { search, status, dateFrom, dateTo, sortBy, sortOrder },
            { skip, limit: Number(limit) }
        );
        res.json({ success: true, data: result });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const quotation = await quotationService.createQuotation(req.body, userId);
        res.status(201).json({ success: true, data: quotation });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const quotation = await quotationService.getQuotationById(req.params.id as string);
        res.json({ success: true, data: quotation });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const quotation = await quotationService.updateQuotation(req.params.id as string, req.body, userId);
        res.json({ success: true, data: quotation });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const result = await quotationService.deleteQuotation(req.params.id as string, userId);
        res.json({ success: true, data: result });
    });

    send = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const quotation = await quotationService.sendQuotation(req.params.id as string, userId);
        res.json({ success: true, data: quotation, message: 'Quotation sent successfully.' });
    });

    approve = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const quotation = await quotationService.approveQuotation(req.params.id as string, userId);
        res.json({ success: true, data: quotation, message: 'Quotation approved.' });
    });

    reject = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { reason } = req.body;
        const quotation = await quotationService.rejectQuotation(req.params.id as string, reason, userId);
        res.json({ success: true, data: quotation, message: 'Quotation rejected.' });
    });

    convertToOrder = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const result = await quotationService.convertToOrder(req.params.id as string, userId);
        res.status(201).json({ success: true, data: result, message: 'Quotation converted to order successfully.' });
    });

    reactivate = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { expiryDate } = req.body;
        const quotation = await quotationService.reactivateExpired(req.params.id as string, expiryDate, userId);
        res.json({ success: true, data: quotation, message: 'Quotation reactivated successfully.' });
    });

    getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
        const analytics = await quotationService.getAnalytics();
        res.json({ success: true, data: analytics });
    });

    expireStale = asyncHandler(async (_req: Request, res: Response) => {
        const result = await quotationService.expireStaleQuotations();
        res.json({ success: true, data: result, message: `${result.expired} quotations expired.` });
    });
}

export const quotationController = new QuotationController();
