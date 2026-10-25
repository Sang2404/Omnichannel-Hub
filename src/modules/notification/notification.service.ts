import { prisma } from '../../config/database';
import { getSocketServer } from '../../config/socket';
import { logger } from '../../shared/utils/logger';

export interface CreateNotificationInput {
  title: string;
  message: string;
  category: 'order' | 'chat' | 'stock' | 'shipping' | 'system';
  link?: string;
}

export class NotificationService {
  /**
   * Creates a notification record and broadcasts it via Socket.io
   */
  async createNotification(data: CreateNotificationInput) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          category: data.category,
          link: data.link || null,
          isRead: false,
        },
      });

      // Try broadcasting to online clients
      try {
        const io = getSocketServer();
        if (io) {
          io.emit('notification:new', notification);
        }
      } catch (socketErr) {
        // Socket may not be initialized in some test contexts
      }

      logger.info(`Notification created: [${data.category.toUpperCase()}] ${data.title}`);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Retrieves notifications list with unread counter.
   * If table is empty, automatically generates initial notifications from actual DB events
   * so the interface reflects real system state immediately.
   */
  async listNotifications(limit = 25) {
    const totalCount = await prisma.notification.count();

    // Auto-seed from real DB events if no notifications exist yet
    if (totalCount === 0) {
      await this.backfillFromRealData();
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Backfills notifications from actual orders, customer chats, and stock in the DB.
   */
  private async backfillFromRealData() {
    try {
      // 1. Fetch real recent orders
      const orders = await prisma.order.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      });

      for (const order of orders) {
        if (order.status === 'PAID') {
          await prisma.notification.create({
            data: {
              title: `Thanh toán thành công #${order.orderCode}`,
              message: `Khách hàng ${order.customer.name} đã thanh toán ${order.totalAmount.toLocaleString('vi-VN')}đ qua PayOS VietQR.`,
              category: 'order',
              link: '/orders',
              isRead: false,
              createdAt: order.updatedAt || order.createdAt,
            },
          });
        } else if (order.status === 'SHIPPED' && order.ghnOrderCode) {
          await prisma.notification.create({
            data: {
              title: `Vận đơn GHN đang giao #${order.orderCode}`,
              message: `Mã vận đơn ${order.ghnOrderCode} đã bàn giao cho bưu tá Giao Hàng Nhanh.`,
              category: 'shipping',
              link: '/orders',
              isRead: false,
              createdAt: order.updatedAt || order.createdAt,
            },
          });
        } else {
          await prisma.notification.create({
            data: {
              title: `Đơn hàng mới #${order.orderCode}`,
              message: `Khách hàng ${order.customer.name} vừa đặt đơn trị giá ${order.totalAmount.toLocaleString('vi-VN')}đ.`,
              category: 'order',
              link: '/orders',
              isRead: false,
              createdAt: order.createdAt,
            },
          });
        }
      }

      // 2. Fetch real recent incoming customer messages
      const messages = await prisma.message.findMany({
        where: { senderType: 'CUSTOMER' },
        take: 2,
        orderBy: { createdAt: 'desc' },
        include: { conversation: { include: { customer: true } } },
      });

      for (const msg of messages) {
        await prisma.notification.create({
          data: {
            title: `Tin nhắn Messenger mới`,
            message: `${msg.conversation.customer.name}: "${msg.content}"`,
            category: 'chat',
            link: '/chat',
            isRead: false,
            createdAt: msg.createdAt,
          },
        });
      }

      // 3. Fetch products with low stock (<= 15 items)
      const lowStockProducts = await prisma.product.findMany({
        where: { stock: { lte: 15 } },
        take: 2,
      });

      for (const prod of lowStockProducts) {
        await prisma.notification.create({
          data: {
            title: `Cảnh báo tồn kho thấp`,
            message: `Sản phẩm "${prod.name}" trong kho chỉ còn ${prod.stock} cái. Vui lòng nhập thêm.`,
            category: 'stock',
            link: '/products',
            isRead: false,
            createdAt: new Date(),
          },
        });
      }
    } catch (err) {
      logger.warn('Failed to backfill notifications:', err);
    }
  }

  /**
   * Marks a single notification as read
   */
  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Marks all unread notifications as read
   */
  async markAllAsRead() {
    return prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Clears a notification
   */
  async deleteNotification(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }
}
