import { axiosClient } from '../../../core/api/axiosClient';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'order' | 'chat' | 'stock' | 'shipping' | 'system';
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export const notificationApi = {
  getNotifications: async (limit = 25): Promise<NotificationResponse> => {
    const res: any = await axiosClient.get('/notifications', {
      params: { limit },
    });
    return res.data;
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res: any = await axiosClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.post('/notifications/read-all');
  },
};
