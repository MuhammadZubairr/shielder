/**
 * Logger Utility
 * Centralized logging for the application
 */

import { env } from '../../config/env';

/**
 * Log levels
 */
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Logger class
 */
class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | any, meta?: any): void {
    const errorDetails = error
      ? {
          message: error.message,
          stack: error.stack,
          ...meta,
        }
      : meta;

    console.error(this.formatMessage(LogLevel.ERROR, message, errorDetails));
  }

  /**
   * Log warning messages
   */
  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  /**
   * Log info messages
   */
  info(message: string, meta?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, meta?: any): void {
    if (env.isDevelopment) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  /**
   * Log HTTP requests
   */
  http(method: string, url: string, statusCode: number, duration: number): void {
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;
    this.info(message);
  }
}

export const logger = new Logger();
export default logger;
