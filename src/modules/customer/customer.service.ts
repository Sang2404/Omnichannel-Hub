import { prisma } from '../../config/database';
import { ApiError } from '../../shared/utils/api-error';
import { z } from 'zod';
import { createCustomerSchema, updateCustomerSchema, queryCustomerSchema } from './customer.validation';

type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
type QueryCustomerInput = z.infer<typeof queryCustomerSchema>;

export class CustomerService {
  /**
   * Creates a new Customer.
   */
  async createCustomer(input: CreateCustomerInput) {
    if (input.fbUserId) {
      const existing = await prisma.customer.findUnique({
        where: { fbUserId: input.fbUserId },
      });
      if (existing) {
        throw ApiError.badRequest(`Customer with Facebook User ID '${input.fbUserId}' already exists`);
      }
    }

    return prisma.customer.create({
      data: input,
    });
  }

  /**
   * Retrieves or creates a customer by Facebook User ID.
   * Useful for auto-creation of customers from incoming chat messages.
   * 
   * @param fbUserId - Unique Facebook User ID
   * @param name - Display name of the Facebook user
   */
  async getOrCreateCustomerByFb(fbUserId: string, name: string) {
    const existing = await prisma.customer.findUnique({
      where: { fbUserId },
    });

    if (existing) {
      return existing;
    }

    return prisma.customer.create({
      data: {
        fbUserId,
        name,
      },
    });
  }

  /**
   * Retrieves a paginated list of customers.
   */
  async listCustomers(query: QueryCustomerInput) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = query.search;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: { orderBy: { createdAt: 'desc' } },
        },
      }),
    ]);

    const now = new Date();

    // Compute RFM Segmentation metrics
    const customersWithRfm = customers.map((c) => {
      const orders = c.orders || [];
      const frequency = orders.length;
      const monetary = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      let recencyDays: number | null = null;
      if (orders.length > 0 && orders[0].createdAt) {
        const lastOrderTime = new Date(orders[0].createdAt).getTime();
        recencyDays = Math.max(0, Math.floor((now.getTime() - lastOrderTime) / (1000 * 60 * 60 * 24)));
      }

      // 4 Phân loại Khách hàng Tinh gọn & Chuẩn xác (Automatic)
      const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');
      const successfulOrders = orders.filter((o) => o.status !== 'CANCELLED');
      const successfulMonetary = successfulOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      let segment: 'VIP' | 'ORDERED' | 'WARNING' | 'NEW' = 'NEW';
      let segmentLabel = 'Khách mới';

      // 1. Cảnh báo boom: có >= 2 đơn hủy HOẶC (có đơn hủy và chưa từng hoàn tất đơn nào)
      if (cancelledOrders.length >= 2 || (cancelledOrders.length >= 1 && successfulOrders.length === 0)) {
        segment = 'WARNING';
        segmentLabel = 'Cảnh báo boom';
      }
      // 2. Khách VIP: chi tiêu >= 1.000.000đ hoặc có >= 3 đơn thành công
      else if (successfulMonetary >= 1000000 || successfulOrders.length >= 3) {
        segment = 'VIP';
        segmentLabel = 'Khách VIP';
      }
      // 3. Khách đã mua: đã có từ 1 - 2 đơn hàng thành công
      else if (successfulOrders.length > 0) {
        segment = 'ORDERED';
        segmentLabel = 'Khách đã mua';
      }
      // 4. Khách mới: chưa từng phát sinh đơn hàng
      else {
        segment = 'NEW';
        segmentLabel = 'Khách mới';
      }

      // Từ điển nhãn cho phân loại thủ công
      const tagLabels: Record<string, string> = {
        VIP: 'Khách VIP',
        ORDERED: 'Khách đã mua',
        WARNING: 'Cảnh báo boom',
        NEW: 'Khách mới',
      };

      const isManual = Boolean(c.customTag);
      const effectiveSegment = (c.customTag as any) || segment;
      const effectiveSegmentLabel = (c.customTag && tagLabels[c.customTag]) || segmentLabel;

      return {
        ...c,
        rfm: {
          recencyDays,
          frequency,
          monetary,
          segment: effectiveSegment,
          segmentLabel: effectiveSegmentLabel,
          autoSegment: segment,
          autoSegmentLabel: segmentLabel,
          isManual,
        },
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      customers: customersWithRfm,
    };
  }

  /**
   * Retrieves a customer by ID.
   */
  async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        conversations: {
          take: 1,
          orderBy: { lastActiveAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    return customer;
  }

  /**
   * Updates an existing customer's profile.
   */
  async updateCustomer(id: string, input: UpdateCustomerInput) {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    if (input.fbUserId && input.fbUserId !== customer.fbUserId) {
      const existingFb = await prisma.customer.findUnique({
        where: { fbUserId: input.fbUserId },
      });
      if (existingFb) {
        throw ApiError.badRequest(`Customer with Facebook User ID '${input.fbUserId}' already exists`);
      }
    }

    return prisma.customer.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Deletes a customer.
   */
  async deleteCustomer(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    await prisma.customer.delete({
      where: { id },
    });

    return { id, message: 'Customer deleted successfully' };
  }
}
