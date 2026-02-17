import { prisma } from '../../config/database';

export class AuditService {
  /**
   * Log an action to the audit_logs table
   */
  static async log(data: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Audit Log Error:', error);
      // Don't throw error to avoid breaking main flow
    }
  }
}
