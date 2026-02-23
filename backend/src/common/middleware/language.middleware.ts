import { Request, Response, NextFunction } from 'express';

/**
 * Language Middleware
 * Normalises the Accept-Language header to 'en' | 'ar' and attaches it to req.locale.
 * Supported locales: 'en' (default), 'ar'
 */
export const languageMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = (req.headers['accept-language'] || '').toLowerCase().trim();
  req.locale = header === 'ar' || header.startsWith('ar') ? 'ar' : 'en';
  next();
};
