import api from './api.service';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  module: string | null;
  isRead: boolean;
  relatedId: string | null;
  triggeredBy: string | null;
  triggeredById: string | null;
  roleTarget: string | null;
  createdAt: string;
  user?: {
    email: string;
    profile?: { fullName: string };
  };
  triggerer?: {
    email: string;
    profile?: { fullName: string };
  };
}

export interface NotificationPreference {
  id?: string;
  lowStock: boolean;
  orderUpdates: boolean;
  payments: boolean;
  newUser: boolean;
  inApp: boolean;
  email: boolean;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  targetRole?: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | null;
  targetUserId?: string | null;
}

const notificationService = {
  getNotifications: (params: {
    page?: number;
    limit?: number;
    type?: string;
    module?: string;
    read?: boolean;
    search?: string;
    global?: boolean;
  } = {}) => {
    return api.get('notifications', { params });
  },

  getStats: () => {
    return api.get('notifications/stats');
  },

  getUnreadCount: () => {
    return api.get('notifications/unread-count');
  },

  getLatest: (limit = 5) => {
    return api.get('notifications/latest', { params: { limit } });
  },

  createNotification: (payload: CreateNotificationPayload) => {
    return api.post('notifications', payload);
  },

  markAsRead: (id: string) => {
    return api.patch(`notifications/${id}/read`);
  },

  markAllAsRead: () => {
    return api.patch('notifications/read-all');
  },

  deleteNotification: (id: string) => {
    return api.delete(`notifications/${id}`);
  },

  getPreferences: () => {
    return api.get('notifications/preferences');
  },

  updatePreferences: (preferences: Partial<NotificationPreference>) => {
    return api.put('notifications/preferences', preferences);
  },
};

export default notificationService;
